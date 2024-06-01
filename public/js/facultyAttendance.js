async function getAttendanceData() {
  const courseId = document.querySelector(
    "form[id='attendance-form'] select[name='courseId']"
  ).value;
  const departmentId = document.querySelector(
    "form[id='attendance-form'] select[name='departmentId']"
  ).value;
  const semester = parseInt(
    document.querySelector("form[id='attendance-form'] select[name='semester']")
      .value
  );
  const table = document.getElementById("attendance-table");

  if (!courseId || !departmentId || !semester) {
    alert("Fill all fields");
    return;
  }

  await fetch("/department-attendance", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      courseId: courseId,
      departmentId: departmentId,
      semester: semester,
    }),
  })
    .then((res) => {
      return res.json();
    })
    .then((json) => {
      // console.log(json);

      for (var i = table.rows.length - 1; i > 0; i--) {
        table.deleteRow(i);
      }

      json.data.forEach((studentData, index) => {
        let newRow = table.insertRow();
        //insert cell
        var slNoCell = newRow.insertCell(0);
        var nameCell = newRow.insertCell(1);
        var totalDaysCell = newRow.insertCell(2);
        var presentDaysCell = newRow.insertCell(3);
        var percentage = newRow.insertCell(4);

        slNoCell.innerHTML = index + 1;
        nameCell.innerHTML = studentData.name;
        totalDaysCell.innerHTML = json.totalDays;
        presentDaysCell.innerHTML = studentData.presentDays;
        percentage.innerHTML = (studentData.presentDays / json.totalDays) * 100;
      });
    })
    .catch((err) => {
      console.log(err);
    });
}

document
  .getElementById("attendance-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    getAttendanceData();
  });
