<?php
// Get the image file name from the query string
$file = $_GET['file'];

// Set the content type header based on the file type
$extension = pathinfo($file, PATHINFO_EXTENSION);
switch ($extension) {
  case 'jpg':
  case 'jpeg':
    header('Content-Type: image/jpeg');
    break;
  case 'png':
    header('Content-Type: image/png');
    break;
  case 'gif':
    header('Content-Type: image/gif');
    break;
  // Add additional cases for other file types as needed
}

// Output the contents of the image file
readfile("img/".$file);
?>
