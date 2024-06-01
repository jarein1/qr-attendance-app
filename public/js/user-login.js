function postUserLogin() {
  // Get the email and password from the form inputs
  var email = document.getElementsByName("email")[0].value;
  var password = document.getElementsByName("password")[0].value;

  console.log("executing this");
  // Send the request
  return fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      password: password,
    }),
  })
    .then((response) => {
      console.log(response);
      return response.json();
    })
    .then((res) => {
      document.cookie = `authToken=${res.token}; path=/; max-age=86400; secure`;
      localStorage.setItem("user_id", res.user_id);
      localStorage.setItem("user_role", res.user_role);
      localStorage.setItem("department", res.user_department);
      localStorage.setItem("semester", res.semester);
      localStorage.setItem("user_name", res.user_name);
      
      window.location.href = "/home";
    })
    .catch((err) => {
      console.log("Error loggin in");
      console.log(err);
      window.location.href = "/login";
    });
  // if (response.ok) {
  //   console.log(response);
  //   console.log("passed");
  //   const res = await response.json();

  //   console.log(res);

  // } else {
  //   console.log("Error loggin in");
  //   window.location.href = "http://localhost:3000/login";
  // }
}

document
  .getElementById("userLoginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the default form submission
    postUserLogin(); // Call login AJAX
  });
