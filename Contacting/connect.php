<!DOCTYPE html>
<html lang="en" dir ="ltr">

  <head>
    <meta charset="utf-8">

  </head>
  <body>

    <h1> HELLO </h1>

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
  echo "Thank you for contacting me,
  I will get back to you as soon as I can.";
  $stmt->close();
  $conn->close();
}
?>

<main>

  </main>

</body>

</html>
