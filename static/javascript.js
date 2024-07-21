const loginForm = document.getElementById("login-form");
const noteForm = document.getElementById("note-form");
const notesContainer = document.getElementById("notes-container");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

let isLoggedIn = false;

loginForm.addEventListener("submit", async(e) => {
    e.preventDefault();
    const username = usernameInput.value;
    const password = passwordInput.value;

    console.log("Submitting login request with:", { username, password });

    try {
        const response = await fetch("http://localhost:8000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.detail}`);
        }
        const data = await response.json();
        console.log("Login successful:", data);
        isLoggedIn = true;
        fetchNotes(); // Fetch notes after successful login
        // Redirect to the notes page
        window.location.href = "/notes.html";
    } catch (error) {
        console.error("Login failed:", error.message);
    }
});
const fetchNotes = async() => {
    if (!isLoggedIn) {
        console.error("You must log in first!");
        return;
    }
    try {
        const response = await fetch("http://localhost:8000/notes");
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const notes = await response.json();
        renderNotes(notes);
    } catch (error) {
        console.error("Failed to fetch notes:", error.message);
    }
};

const renderNotes = (notes) => {
    notesContainer.innerHTML = ""; // Clear existing notes
    notes.forEach((note) => {
        const noteElement = document.createElement("div");
        noteElement.classList.add("note");
        noteElement.innerHTML = `
            <h3>${note.title}</h3>
            <p>${note.description}</p>
            <span>${note.date}</span>
        `;
        notesContainer.appendChild(noteElement);
    });
};

noteForm.addEventListener("submit", async(e) => {
    e.preventDefault();
    if (!isLoggedIn) {
        console.error("You must log in first!");
        return;
    }
    const formData = new FormData(noteForm);
    const title = formData.get("title");
    const description = formData.get("description");

    console.log("Submitting note:", { title, description });

    try {
        const response = await fetch("http://localhost:8000/notes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title,
                description,
                date: new Date().toLocaleDateString(), // Example date format
            }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.detail}`);
        }
        const data = await response.json();
        console.log("Note added successfully:", data);
        fetchNotes(); // Refresh notes list
    } catch (error) {
        console.error("Note addition failed:", error.message);
    }
});