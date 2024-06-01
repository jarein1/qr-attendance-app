async function postAdminLogin() {
  // Get the email and password from the form inputs
  var email = document.getElementsByName("email")[0].value;
  var password = document.getElementsByName("password")[0].value;

  // Send the request
  await fetch("/admin/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      password: password,
    }),
  }).then((res) => {
    document.cookie = `authToken=${res.token}; path=/; max-age=86400; secure`;
    localStorage.setItem("user_id", res.user_id);
    localStorage.setItem("user_role", res.user_role);

    window.location.href = "/admin/home";
  });
}

document
  .getElementById("adminLoginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the default form submission
    postAdminLogin(); // Call your AJAX function
  });
