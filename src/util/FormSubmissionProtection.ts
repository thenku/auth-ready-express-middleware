class FormSubmissionProtection {
    //I'd rather authenticate the user through an app before sending any emails

    //each form submission has a unique path generated uuid4 that maps to a table
    //the time difference between the form request and the form submission can be limited to a range
    
    //honeypot field contains a random dictionary word that must not be tampered with
    //honeypot2 field contains a random dictionary word that is changed by client javascript when clicks or focus are detected
    //honeypot3 is set based on whether the client is a navigator.webdriver (usually selenium | puppeteer) or not
    //honeypot4 can detect the order of fields being filled out
    
    // simple game-challendges can be added to the form

    // an authenticator app can be used to detect human behavior and verify the user

    // a date field can be used to detect human behavior
    // an age field can be used to detect human behavior
    // a location field can be used to detect human behavior

    //a random field can be used to detect human behavior

    //when a field is clicked on
}