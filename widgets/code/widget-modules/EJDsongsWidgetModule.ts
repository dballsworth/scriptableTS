// Based on https://github.com/drewkerr/scriptable/blob/main/Sticky%20widget.js

import { IWidgetModule } from "code/utils/interfaces"

const imageURL = "https://raw.githubusercontent.com/dballsworth/nextGigWidget/main/dblogo.jpeg";
let trelloDeveloperKey = "c5bf5abe532082fed089ddb1c8683d78"
let trelloDeveloperToken = "ATTAfa10264547870cfffe3bcff8169a588a3989faf21d0e6c9925d19ed4671afdb3FBDAE991"
let trelloBoardId = "xBSOfe7V"
let trelloListName = "1 song widget"


const createWidget = async (note: string) => {
    let widget = new ListWidget()
    widget.setPadding(16, 16, 16, 8)
    
    let bgColor = new Color("#1c1c1c")
    widget.backgroundColor = bgColor

    
    widget.url = "https://trello.com/b/xBSOfe7V/songs-songs-songs"
    

    try{
        //add the logo image
        let logoImage = await loadLogoImage("dblogo.jpeg");
        let stack = widget.addStack();
        stack.layoutVertically();
        stack.centerAlignContent();
        //let imgStack = stack.addImage(logoImage);
        //imgStack.imageSize = new Size(40, 40);
        //imgStack.rightAlignImage();

        // Add countdown next to the logo
        stack.addSpacer(5);
        let countdownText = stack.addText("SONG TO LEARN:");
        styleTitle(countdownText);
        stack.addSpacer(15);
        //addTextToStack(stack, countdownText, Font.boldSystemFont(16), "#ffcc00");

        // Add the song
        let launch = await getSong();
        console.log("song:");
        console.log(launch);
        let songText = stack.addText(launch);
        styleText(songText);
        //addTextToStack(stack, launch, Font.boldSystemFont(16), "#ffcc00");  

    


    } catch (e) {
        console.log(e)
        let errorText = widget.addText("Error: " + e.message);
        errorText.textColor = new Color("#ff0000");
        errorText.font = Font.boldSystemFont(14);
    }   


    return widget
}



// Utility function to add text to a stack
function addTextToStack(stack, text, font, color) {
    let textElement = stack.addText(text);
    textElement.centerAlignText();
    textElement.font = font;
    textElement.textColor = new Color(color);
}


// Style the countdown text
function styleText(textElement) {
    textElement.font = Font.boldSystemFont(16);
    textElement.textColor = new Color("#ffcc00");
    textElement.centerAlignText();
    textElement.minimumScaleFactor = 0.5;
}

function styleTitle(textElement) {
    textElement.font = Font.boldSystemFont(16);
    textElement.textColor = new Color("#d84d8e");
    textElement.centerAlignText();
    textElement.minimumScaleFactor = 0.5;
}




// Fetch list ID by name from the board
async function getListIdByName(boardId: string, listName: string): Promise<string> {
    const url = `https://api.trello.com/1/boards/${boardId}/lists?key=${trelloDeveloperKey}&token=${trelloDeveloperToken}`;
    const request = new Request(url);
    const lists = await request.loadJSON();

    const targetList = lists.find(list => list.name === listName);

    if (!targetList) {
        throw new Error(`List "${listName}" not found on board`);
    }

    return targetList.id;
}

// Fetch the first card from a list
async function getFirstCardFromList(listId: string): Promise<string> {
    const url = `https://api.trello.com/1/lists/${listId}/cards?key=${trelloDeveloperKey}&token=${trelloDeveloperToken}`;
    const request = new Request(url);
    const cards = await request.loadJSON();

    if (!cards || cards.length === 0) {
        throw new Error("No cards found in the '1 song widget' list");
    }

    const songName = cards[0].name;

    if (!songName || songName === "") {
        throw new Error("First card has no name");
    }

    return songName;
}

// Fetch the song name from the first card in the list
async function getSong() {
    const listId = await getListIdByName(trelloBoardId, trelloListName);
    const songName = await getFirstCardFromList(listId);
    return songName;
}


// Load the logo image
async function loadLogoImage(filename: string): Promise<Image> {
    let files = FileManager.iCloud();
    let path = files.joinPath(files.documentsDirectory(), filename);
    
    if (!files.fileExists(path)) {
        console.log("Image not found locally. Downloading from URL...");
        let req = new Request(imageURL);
        let img = await req.loadImage();
        files.writeImage(path, img);
        return img;
    }
    console.log("Image loaded locally.");
    return files.readImage(path);
}

const widgetModule: IWidgetModule = {
    createWidget: async (params) => {
        return createWidget(params.widgetParameter)
    }
}

module.exports = widgetModule;