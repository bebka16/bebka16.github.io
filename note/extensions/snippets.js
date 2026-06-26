(function() {
    console.log('Code Snippets Pro extension loaded');
    
    window.DecibelNote = window.DecibelNote || {};
    window.DecibelNote.snippets = {
        hello: function() {
            console.log('Hello from Snippets extension!');
        }
    };
})();