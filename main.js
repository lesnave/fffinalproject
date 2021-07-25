'use strict';

const fs = require('fs').promises;

function parseFile(inputFilename){
    return fs.readFile(inputFilename, 'utf8');
}

function processStopFile(parsedFile){
    return parsedFile.replace(/\r/g, "").split('\n');
}

function processInputFile(parsedFile){
    return parsedFile.replace(/[^ a-zA-Z]/g, ' ').split(' ').filter(Boolean);
}

const map = {
    ZL: 'A',
    PLZ: 'AZ',
    EZL: 'R'
}

function rootWordFinder(word =''){
    return word.replace(/(?<=[A-Z])(ZL|PLZ|EZL|L|LZ|EVM|ZQ)$/g, (match) => {
        return map[match] || '';
    });
}

function wordCounter (stringArr, stopList, excludeStopWords, removeSuffixes) {
    return stringArr.reduce((count, word) => { 
        const rootWord = removeSuffixes ? rootWordFinder(word) : word;
        if(rootWord) {
            if (!(excludeStopWords && stopList.includes(rootWord))){
                const previousCount = count.get(rootWord);
                count.set(rootWord, (previousCount || 0) + 1);
            }
        }
        return count;

    }, new Map());
}


function sortList(list){
    return  [...list].sort(([,a],[,b]) => b-a).slice(0,25);
}

async function main(){
    if (process.argv.length < 5) {
        console.log('Usage: (FILENAME) (Exclude Stop Words true or false) (remove suffixes from Words true or false)' );
        process.exit(1);
    }
    const [ , , file, stopWordCheck, suffixCheck] = process.argv
    const stopList = await parseFile('stopwords.txt').then(processStopFile);
    const processedInput = await parseFile(file).then(processInputFile);

    const wordCountObject = wordCounter(processedInput, stopList, stopWordCheck === 'true', suffixCheck ==='true');
    const sortedList = sortList(wordCountObject);
    console.log(Object.fromEntries(sortedList));
 }
return main();
 
 
 
 
 
