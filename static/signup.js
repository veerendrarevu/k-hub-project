document.getElementById('registrationForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const formData = new FormData(this);
    console.log(formData);
    // Log the form data to the console

    try {
        const response = await fetch("http://localhost:8000/register", {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        console.log(data);
        if (response.ok) {
            window.location.href = "login.html";
        } else {
            console.error('Registration failed:', data.detail);
        }
    } catch (error) {
        console.error('Registration failed:', error.message);
    }
});