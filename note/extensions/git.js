(function() {
    console.log('No Pro extension loaded');
    
    window.DecibelNote = window.DecibelNote || {};
    window.DecibelNote.snippets = {
        hello: function() {
            console.log('No from Snippets extension!');
        }
    };
})();