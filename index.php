<?php
include_once("php/session.php");

$title = "Goods and Gift";
$description = "Custom design goods and gift items - Order online, various customization options, fast service, quality products. Free pick up.";
$image_url = "Your Image URL";
$keywords = "Goods and gift, custom print, Vinyl print, Tumblers, Keychain, Toys, Onesies, TShirt, Bottle, Lamp, Ottawa, Stittsville, Canada";

//SM-TODONE-Revert below
$page_url = $_SERVER["HTTP_HOST"] . $_SERVER["REQUEST_URI"];
//$page_url = $_SERVER["REQUEST_URI"];

$path = urldecode($_SERVER["REQUEST_URI"]);
$path = substr($path, 1);

$isCrawler = isset($_SERVER['HTTP_USER_AGENT'])
	&& preg_match('/bot|crawl|slurp|spider|mediapartners|InspectionTool|GoogleOther/i', $_SERVER['HTTP_USER_AGENT']);

//if ($isCrawler) {
	if (strpos($path, 'product/') !== false) {
		$itemWithId = substr($path, strpos($path, "product/") + 8);
		$br = explode('-', $itemWithId);
		$itemid = $br[count($br) - 1];

		$dummy = $database->getItembyId($itemid);
		//$title = $dummy;
		if ($dummy != "Err in DB call") {
			$title = $_SESSION['webTitle'];
			$description = $_SESSION['webDesc'];
			$image_url = "https://goodsandgift.com/getimage/" . $_SESSION['weboimage'];
			$keywords = $_SESSION['webKeywords'];
			$webFullDesc = $_SESSION['webFullDesc'];
		}
	}
//}

?>
<!DOCTYPE html>
<html lang="en">

<head>
	<!-- Google tag (gtag.js) -->
	<script async src="https://www.googletagmanager.com/gtag/js?id=G-JMD8K2RLDE"></script>
	<script>
		window.dataLayer = window.dataLayer || [];
		function gtag() { dataLayer.push(arguments); }
		gtag('js', new Date());

		gtag('config', 'G-JMD8K2RLDE');
	</script>

	<meta charset="utf-8" />
	<title>
		<?php echo $title; ?>
	</title>
	<meta name="description" content="<?php echo htmlspecialchars($description, ENT_QUOTES, 'UTF-8'); ?>">
	<meta property="og:title" content="<?php echo htmlspecialchars($title, ENT_QUOTES, 'UTF-8'); ?>">
	<meta property="og:description" content="<?php echo htmlspecialchars($description, ENT_QUOTES, 'UTF-8'); ?>">
	<meta property="og:image" content="<?php echo $image_url; ?>">
	<meta property="og:url" content="<?php echo $page_url; ?>">
	<meta name="keywords" content="<?php echo $keywords; ?>">

	<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
	<meta name="author" content="Numerouno" />
	<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

	<!-- Favicon-->
	<link rel="icon" type="image/x-icon" href="/goodsandgift/assets/gift.ico" />
	<!-- Core theme CSS (includes Bootstrap)
		 -->
	<link href="/goodsandgift/css/codescriber-0.1.css" rel="stylesheet" />

	<?php if (!$isCrawler): ?>
		<?php include 'head-add.html'; ?>
	<?php endif; ?>

	<script type="application/ld+json">{
		"@context": "https://schema.org/",
		"@type":"WebSite","url":"https://goodsandgift.com/",
		"name": "Custom design goods and gift items",
		"datePublished": "2022-07-31",
		"description": "Custom design goods and gift items - Order online, various customization options, fast service, quality products",
		"thumbnailUrl": "https://goodsandgift.com/images/banner.png"         
	 }
	</script>

</head>

<body>
	<?php if (!$isCrawler): ?>
		<?php include 'body-main.html'; ?>
	<?php else: ?>
		<h1>
			<?= $_SESSION['webTitle'] ?>
		</h1><br>


		<div style="margin: auto; padding:10px">
			<?= $_SESSION['webFullDesc'] ?>
		</div>
	<?php endif; ?>

</body>

</html>