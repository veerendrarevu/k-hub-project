const addBox = document.querySelector(".add-box");
const popUpBox = document.querySelector(".popup-box");
const closeIcon = document.querySelector("header i");
const titleTag = document.querySelector("#title-input");
const descTag = document.querySelector("#desc-input");
const addBtn = document.querySelector(".add-note");
const popupTitle = document.querySelector("header p");
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

let notes = []; // Initialize notes array to store notes from localStorage
let isUpdate = false;
let updateId = null;

// Event listener for clicking on "Add new note"
addBox.addEventListener("click", function() {
    titleTag.focus();
    popUpBox.classList.add("show");
});

// Event listener for clicking on close icon
closeIcon.addEventListener("click", () => {
    popUpBox.classList.remove("show");
});

// Event listener for form submission
document.getElementById("note-form").addEventListener("submit", async function(event) {
    event.preventDefault();

    let noteTitle = titleTag.value;
    let noteDesc = descTag.value;

    if (noteTitle || noteDesc) {
        let dateObj = new Date();
        let month = months[dateObj.getMonth()];
        let day = dateObj.getDate();
        let year = dateObj.getFullYear();

        let noteInfo = {
            title: noteTitle,
            description: noteDesc,
            date: `${month} ${day} ${year}`
        };

        try {
            let response;
            if (isUpdate) {
                // Update existing note
                response = await fetch(`http://localhost:8000/notes/${updateId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(noteInfo),
                });
            } else {
                // Add new note
                response = await fetch("http://localhost:8000/notes", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(noteInfo),
                });
            }

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log(data);

            if (isUpdate) {
                // Update notes array and localStorage for an existing note
                notes[updateId] = noteInfo;
            } else {
                // Add new note to notes array and localStorage
                notes.push(noteInfo);
            }
            localStorage.setItem("notes", JSON.stringify(notes));

            closeIcon.click(); // Close the popup
            showNotes(); // Refresh the UI
        } catch (error) {
            console.error("Note operation failed:", error.message);
        } finally {
            // Reset update flags and form state
            isUpdate = false;
            updateId = null;
            addBtn.innerText = "Add Note";
            popupTitle.innerText = "Add a New Note";
            document.getElementById("note-form").reset();
        }
    }
});
// Function to fetch notes from localStorage and display them
function showNotes() {
    document.querySelectorAll(".note").forEach(note => note.remove());
    notes.forEach((note, index) => {
        let liTag = `
            <li class="note">
                <div class="details">
                    <p>${note.title}</p>
                    <span>${note.description}</span>
                </div>
                <div class="bottom-content">
                    <span>${note.date}</span>
                    <div class="settings">
                        <i onclick="showMenu(this)" class="uil uil-ellipsis-h"></i>
                        <ul class="menu">
                            <li onclick="updateNote(${index}, '${note.title}', '${note.description}')">
                                <i class="uil uil-pen"></i>Edit
                            </li>
                            <li onclick="deleteNote('${index}')">
                                <i class="uil uil-trash"></i>Delete
                            </li>
                        </ul>
                    </div>
                </div>
            </li>`;
        addBox.insertAdjacentHTML("afterend", liTag);
    });
}

// Function to handle delete note operation
async function deleteNote(noteId) {
    let confirmDel = confirm("Are you sure you want to delete this item?");
    if (!confirmDel) return;

    try {
        // Send DELETE request to backend API
        const response = await fetch(`http://localhost:8000/notes/${noteId}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        notes.splice(noteId, 1); // Remove note from notes array
        localStorage.setItem("notes", JSON.stringify(notes)); // Update localStorage
        showNotes(); // Refresh the UI
    } catch (error) {
        console.error("Note deletion failed:", error.message);
    }
}

// Function to prepare for updating a note
function updateNote(noteId, title, desc) {
    isUpdate = true;
    updateId = noteId; // Store the index of the note to be updated
    titleTag.value = title; // Populate title input with existing title
    descTag.value = desc; // Populate description input with existing description
    addBtn.innerText = "Update Note"; // Change button text to indicate update operation
    popupTitle.innerText = "Update a Note"; // Change popup title if needed
    popUpBox.classList.add("show"); // Show the popup box for editing
}
// Function to show/hide settings menu for a note
function showMenu(elem) {
    elem.parentElement.classList.toggle("show");
    document.addEventListener("click", e => {
        if (e.target.tagName !== "I" || e.target !== elem) {
            elem.parentElement.classList.remove("show");
        }
    });
}


// Load notes from localStorage on page load
notes = JSON.parse(localStorage.getItem("notes") || "[]");
showNotes(); // Display notes initially