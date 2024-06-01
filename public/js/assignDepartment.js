const postSubmitAssignDepartment = async () => {
    const selectedCourse = document.querySelector(
      "form[name='submitDepartmentListForm'] input[name='currentCourse']"
    );
    const departmentSize = document.querySelector(
      "form[name='submitDepartmentListForm'] input[name='departmentSize']"
    );
  
    if (!selectedCourse || !departmentSize) {
      console.log("failed form submission");
      return;
    }
  
    const departmentListAdd = [];
    const departmentListRemove = [];
    for (let i = 1; i <= departmentSize.value; i++) {
      const department = document.getElementById(`check-${i}`);
      if (department.checked) {
        departmentListAdd.push(department.value);
      } else {
        departmentListRemove.push(department.value);
      }
    }
  
    // Send the request
    await fetch("/admin/submit-assigned-department", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        course: selectedCourse.value,
        departmentSize: departmentSize,
        departmentAdd: departmentListAdd,
        departmentRemove: departmentListRemove,
      }),
    })
      .then((res) => {
        window.location.href = "/admin/assign-department";
      })
      .catch((err) => {
        console.log(err);
      });
  };
  
  document
    .getElementById("departmentSubmitForm")
    .addEventListener("submit", function (event) {
      event.preventDefault(); // Prevent the default form submission
      postSubmitAssignDepartment(); // Call your AJAX function
    });
  