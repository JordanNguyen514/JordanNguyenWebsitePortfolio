<!DOCTYPE html>
<html lang="en" dir ="ltr">

  <head>
    <meta charset="utf-8">
    <meta name="viewport" content =
    "width=device-width, initial-scale=1">

    <meta name="description" content =
    "Contact Page">

    <title>Connect Page</title>

    <link rel = "stylesheet" href = "connect.css">
    <script src="../jquery-3.5.0.js" defer></script>
    <script src="connect.js" defer></script>

  </head>
  <body onload ="startTime()">

    <div class="topnav">

              <a href="../index.html"> Home </a>
              <div class="dropdown2">
                <button class="dropbtn2"> Browse
                </button>
                  <div class="dropdown-content2">
                    <a href="#">Career Portfolio</a>
                    <a>Academics</a>
                    <a href="#">Skills</a>
                    <a href="#">Other interests</a>
                  </div>
              </div>

              <div class="dropdown">
                <button class="dropbtn"> Language
                </button>
                  <div class="dropdown-content">
                    <a href="#">English</a>
                    <a href="#">French</a>
                    <a href="#">Vietnamese</a>
                  </div>
              </div>

              <a id="time"></a>
        </div>

    <div class="container">

      <h1>Thank you for contacting me,
      I will get back to you as soon as I can.</h1>

    </div>

<?php
$firstName = $_POST['firstName'];
$lastName = $_POST['lastName'];
$Purpose = $_POST['Purpose'];
$email = $_POST['email'];
$number = $_POST['number'];
$Message = $_POST['Message'];

// Database connection
$conn = new mysqli('localhost','root','','test');
if($conn->connect_error){
  echo "$conn->connect_error";
  die("Connection Failed : ". $conn->connect_error);
} else {
  $stmt = $conn->prepare("insert into registration(firstName, lastName, Purpose, email, number, Message ) values(?, ?, ?, ?, ?, ?)");
  $stmt->bind_param("ssssis", $firstName, $lastName, $Purpose, $email, $number, $Message);
  $execval = $stmt->execute();
  $stmt->close();
  $conn->close();
}
?>

<main>

  </main>

</body>

</html>
