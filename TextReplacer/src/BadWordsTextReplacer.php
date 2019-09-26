<?php

namespace TextReplacer;

/**
 * Bad words text replacer
 */
class BadWordsTextReplacer extends TextReplacer
{

    /**
     * replace given text @see setText(),
     * passed dictionary @see setDcitionary()
     * and replacement string @see setReplacement()
     * 
     */
    public function replace()
    {
        $dictionary = $this->getDictionary();        
        $text = $this->getText();

        if (empty($dictionary) || empty($text)) {
            return $text;
        }

        $dictionaryPiped = implode('|', $dictionary);

        $pattern = "/(\w+)?($dictionaryPiped)(\w+)?/";

        $replacement = $this->getReplacement();

        //replace every single character from matched words
        //but ignore non-word characters
        //so the user can not break the words via them
        //for example f.ucking will be replace with *******
        //
        $text = preg_replace_callback(
            $pattern,
            function ($matches) use ($replacement) {
                return str_repeat($replacement, strlen($matches[0]));
            }, preg_replace('/[.,?!]/', '', $text)
        );

        return $text;
    }
}