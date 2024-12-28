(function () {

    // Based on https://github.com/drewkerr/scriptable/blob/main/Sticky%20widget.js
    const imageURL = "https://raw.githubusercontent.com/dballsworth/nextGigWidget/main/dblogo.jpeg";
    const createWidget = async (note) => {
        let widget = new ListWidget();
        widget.setPadding(16, 16, 16, 8);
        let bgColor = new Color("#1c1c1c");
        widget.backgroundColor = bgColor;
        widget.url = "https://dickensandballsworth.com/dates-%26-shows";
        try {
            //add the logo image
            let logoImage = await loadLogoImage("dblogo.jpeg");
            let stack = widget.addStack();
            stack.layoutHorizontally();
            stack.centerAlignContent();
            let imgStack = stack.addImage(logoImage);
            imgStack.imageSize = new Size(40, 40);
            imgStack.rightAlignImage();
            // Add countdown next to the logo
            stack.addSpacer(5);
            let countdownText = stack.addText(await getCountdownText());
            styleCountdownText(countdownText);
            // Add the launch date and location
            let launch = await getNextLaunch();
            displayLaunchDateTime(widget, getFormattedLaunchDate(launch.rStartDate));
            displayLocation(widget, launch.rSummary);
        }
        catch (e) {
            console.log(e);
            let errorText = widget.addText("Error: " + e.message);
            errorText.textColor = new Color("#ff0000");
            errorText.font = Font.boldSystemFont(14);
        }
        return widget;
    };
    // Get formatted launch date
    function getFormattedLaunchDate(launchData) {
        if (!launchData)
            return "Date not available";
        let launchDateTime = new Date(launchData);
        let options = {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        };
        return launchDateTime.toLocaleString('en-US', options);
    }
    // Utility function to add text to a stack
    function addTextToStack(stack, text, font, color) {
        let textElement = stack.addText(text);
        textElement.centerAlignText();
        textElement.font = font;
        textElement.textColor = new Color(color);
    }
    // Display launch date in the widget
    function displayLaunchDateTime(stack, launchDateTime) {
        addTextToStack(stack, launchDateTime, Font.semiboldSystemFont(15), "#ffffff");
    }
    // Display location in the widget
    function displayLocation(stack, location) {
        addTextToStack(stack, location || "Location not available", Font.thinSystemFont(15), "#ffffff");
    }
    // Style the countdown text
    function styleCountdownText(textElement) {
        textElement.font = Font.boldSystemFont(16);
        textElement.textColor = new Color("#ffcc00");
        textElement.centerAlignText();
        textElement.minimumScaleFactor = 0.5;
    }
    // Calculate countdown in days
    function getCountdown(eventDate) {
        let eventDateTime = new Date(eventDate);
        let currentDateTime = new Date();
        let daysLeft = Math.floor((eventDateTime.getTime() - currentDateTime.getTime()) / (1000 * 60 * 60 * 24));
        return daysLeft > 0 ? `${daysLeft} days` : "Today!";
    }
    // Get the next upcoming event from the calendar data
    function getNextUpcomingEvent(iCalendarData) {
        return iCalendarData && iCalendarData.length > 0 ? iCalendarData[0] : null;
    }
    // Fetch the next launch data
    async function getNextLaunch() {
        const url = "https://smipleexpressapp.netlify.app/.netlify/functions/api/events";
        const request = new Request(url);
        const response = await request.loadJSON();
        let launch = getNextUpcomingEvent(response);
        if (!launch || !launch.start) {
            throw new Error("No upcoming events found or start date is missing");
        }
        return { rStartDate: launch.start, rSummary: launch.summary };
    }
    // Fetch and format countdown text
    async function getCountdownText() {
        let launch = await getNextLaunch();
        if (!launch.rStartDate) {
            throw new Error("Launch date is undefined");
        }
        return getCountdown(launch.rStartDate);
    }
    // Load the logo image
    async function loadLogoImage(filename) {
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
    const widgetModule = {
        createWidget: async (params) => {
            return createWidget(params.widgetParameter);
        }
    };
    module.exports = widgetModule;

})();
