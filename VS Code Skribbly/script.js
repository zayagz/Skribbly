const dashboard = document.querySelector(".dashboard-content");
const projectList = document.querySelector(".project-list");
const addProjectBtn = document.querySelector(".add-project-btn");

let projects = JSON.parse(localStorage.getItem("scribbly-projects") || "[]");
let activeProject = localStorage.getItem("active-project") || null;

function saveProjects() {
  localStorage.setItem("scribbly-projects", JSON.stringify(projects));
  localStorage.setItem("active-project", activeProject);
}

function renderProjects() {
  projectList.innerHTML = "";
  projects.forEach((name) => {
    const item = document.createElement("div");
    item.className = "project-item" + (name === activeProject ? " active" : "");

    item.innerHTML = `
      <span>${name}</span>
      <span class="delete-project" title="Delete project" data-name="${name}">&times;</span>
    `;

    item.querySelector("span:first-child").addEventListener("click", () => {
      activeProject = name;
      saveProjects();
      renderProjects();
      renderNotes();
    });

    item.querySelector("span:first-child").addEventListener("dblclick", () => {
      const newName = prompt("Rename project:", name);
      if (newName && newName !== name) {
        projects = projects.map(p => (p === name ? newName : p));
        let notes = JSON.parse(localStorage.getItem("scribbly-notes") || "[]");
        notes.forEach(n => {
          if (n.project === name) n.project = newName;
        });
        localStorage.setItem("scribbly-notes", JSON.stringify(notes));
        activeProject = newName;
        saveProjects();
        renderProjects();
        renderNotes();
      }
    });

    item.querySelector(".delete-project").addEventListener("click", (e) => {
      e.stopPropagation();
      const toDelete = e.target.dataset.name;
      if (confirm(`Delete project "${toDelete}" and all its notes?`)) {
        projects = projects.filter(p => p !== toDelete);
        let notes = JSON.parse(localStorage.getItem("scribbly-notes") || "[]");
        notes = notes.filter(n => n.project !== toDelete);
        localStorage.setItem("scribbly-notes", JSON.stringify(notes));

        if (activeProject === toDelete) {
          activeProject = projects[0] || null;
        }

        saveProjects();
        renderProjects();
        renderNotes();
      }
    });

    projectList.appendChild(item);
  });
}

addProjectBtn.onclick = () => {
  const name = prompt("New project name:");
  if (!name || projects.includes(name)) return;
  projects.push(name);
  activeProject = name;
  saveProjects();
  renderProjects();
  renderNotes();
};

function renderNotes() {
  dashboard.innerHTML = "";
  const notes = JSON.parse(localStorage.getItem("scribbly-notes") || "[]");
  const projectNotes = notes.filter(n => n.project === activeProject);

  projectNotes.forEach((note, index) => {
    const noteDiv = document.createElement("div");
    noteDiv.className = "sticky-note";

    const title = document.createElement("div");
    title.className = "note-title";
    title.innerText = note.title;
    noteDiv.appendChild(title);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-button";
    deleteBtn.innerText = "✖";
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const realIndex = notes.findIndex(n => n.title === note.title && n.project === activeProject);
      notes.splice(realIndex, 1);
      localStorage.setItem("scribbly-notes", JSON.stringify(notes));
      renderNotes();
    });
    noteDiv.appendChild(deleteBtn);

    noteDiv.addEventListener("click", () => {
      const index = notes.findIndex(n => n.title === note.title && n.project === activeProject);
      localStorage.setItem("edit-index", index);
      window.location.href = "note.html";
    });

    dashboard.appendChild(noteDiv);
  });

  const addNoteBtn = document.createElement("div");
  addNoteBtn.className = "sticky-note add-note";
  addNoteBtn.innerText = "+";
  addNoteBtn.addEventListener("click", () => {
    localStorage.removeItem("edit-index");
    window.location.href = "note.html";
  });

  dashboard.appendChild(addNoteBtn);
}

renderProjects();
renderNotes();