const postSubmitAssignFaculty = async () => {
  const selectedCourse = document.querySelector(
    "form[name='submitFacultyListForm'] input[name='currentCourse']"
  );
  const facultySize = document.querySelector(
    "form[name='submitFacultyListForm'] input[name='facultySize']"
  );

  if (!selectedCourse || !facultySize) {
    console.log("failed form submission");
    return;
  }

  const facultyListAdd = [];
  const facultyListRemove = [];
  for (let i = 1; i <= facultySize.value; i++) {
    const faculty = document.getElementById(`check-${i}`);
    if (faculty.checked) {
      facultyListAdd.push(faculty.value);
    } else {
      facultyListRemove.push(faculty.value);
    }
  }

  // Send the request
  await fetch("/admin/submit-assigned-faculty", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      course: selectedCourse.value,
      facultySize: facultySize,
      facultyAdd: facultyListAdd,
      facultyRemove: facultyListRemove,
    }),
  })
    .then((res) => {
      window.location.href = "/admin/assign-faculty";
    })
    .catch((err) => {
      console.log(err);
    });
};

document
  .getElementById("facultySubmitForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the default form submission
    postSubmitAssignFaculty(); // Call your AJAX function
  });
