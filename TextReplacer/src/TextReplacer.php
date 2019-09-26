<?php

namespace TextReplacer;

/**
 * abstract class for Text replacement
 */
abstract class TextReplacer
{
    /**
     * do the actual job which will be implemented by specific classes
     * 
     */
    abstract public function replace();

    /**
     * dictionary of words that will be replaced
     * 
     * @var null
     * 
     */
    protected $dictionary = null;

    /**
     * set dictionary
     *  
     * @param mixed $dictionary
     * 
     */
    public function setDictionary($dictionary)
    {
        $this->dictionary = $dictionary;
        return $this;
    }

    /**
     * get dictionary
     * 
     * @return mixed dictionary
     * 
     */
    public function getDictionary()
    {
        return $this->dictionary;
    }

    /**
     * text on which checks for replacement will be done
     * 
     * @var mixed
     * 
     */
    protected $text;

    /**
     * set text
     * 
     * @param mixed 
     * 
     */
    public function setText($text)
    {
        $this->text = $text;
        return $this;
    }

    /**
     * get text
     * 
     * @return mixed text
     * 
     */
    public function getText()
    {
        return $this->text;
    }

    /**
     * what text will be replaced with
     * 
     * @var mixed
     * 
     */
    protected $replacement;

    /**
     * set replacement
     *
     * @param mixed $replacement
     */
    public function setReplacement($replacement)
    {
        $this->replacement = $replacement;
        return $this->replacement;
    }

    /**
     * get replacement
     *
     * @return mixed replacement
     * 
     */
    public function getReplacement()
    {
        return $this->replacement;
    }
}