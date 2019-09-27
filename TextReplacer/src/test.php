<?php

namespace TextReplacer;

require_once __DIR__ . '/../vendor/autoload.php';

/*

$dictionary = [
	'fuck',
];

$string = 'I\'m fucking genius and I don\'t give a fuck';

$replacement = '*';

use \TextReplacer\BadWordsTextReplacer;

$badWordsReplacer = new BadWordsTextReplacer();

$badWordsReplacer->setDictionary($dictionary);

$badWordsReplacer->setText($string);

$badWordsReplacer->setReplacement($replacement);

$string = $badWordsReplacer->replace();
var_dump($string);
exit;
*/

function replace_dirty_words(String $text, array $bad_words)
{
	if (empty($text) || empty($bad_words)) {
		return $text;
	}

	//dependency but in order to complete the task
	//
	$badWordsReplacer = new BadWordsTextReplacer();

	$badWordsReplacer->setDictionary($bad_words);

	$badWordsReplacer->setText($text);

	$replacement = '*';

	$badWordsReplacer->setReplacement($replacement);

	$string = $badWordsReplacer->replace();

	return $string;
}

$string = 'I\'m fucking genius and I don\'t give a fuck';

$bad_words = [
	'fuck',
];

$string = replace_dirty_words($string, $bad_words);
var_dump($string);
