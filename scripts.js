// script.js

document.addEventListener("DOMContentLoaded", function() {
    setTimeout(function() {
        // Hide the loading screen
        document.getElementById('loadingScreen').style.display = 'none';
    }, 3000); // Hide after 3 seconds for demonstrative purposes
});

// TODO further below on the page add a fallen animated with the sprite sheet running away from the cursor
// TODO click on the fallen to kill it with death animation and sound
// TODO regular fallen sound with position of the sound relative to scroll position and fallen position
// TODO reinforcement learning to learn the best way for the fallen to run away from the cursor
// TODO button click sounds from diablo 2
// TODO cursor from diablo 2
// TODO retro music