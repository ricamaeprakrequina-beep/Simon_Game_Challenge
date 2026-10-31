$(function () {
  const colors = ["green", "red", "yellow", "blue"];
  const questions = [
    {
      question: "Which keyword declares a variable that can be reassigned in JavaScript?",
      answers: ["const", "let", "return"],
      correct: "let"
    },
    {
      question: "Which data type represents true or false?",
      answers: ["String", "Array", "Boolean"],
      correct: "Boolean"
    },
    {
      question: "What does HTML primarily describe?",
      answers: ["A database", "The computer's operating system", "The structure of a web page"],
      correct: "The structure of a web page"
    },
    {
      question: "Which symbol is commonly used for strict equality in JavaScript?",
      answers: ["===", "=", "=>"],
      correct: "==="
    },
    {
      question: "What is a function?",
      answers: ["A kind of image file", "A reusable block of code", "A programming error"],
      correct: "A reusable block of code"
    }
  ];

  let gamePattern = [];
  let userPattern = [];
  let level = 0;
  let started = false;
  let acceptingInput = false;
  let currentQuestion;

  function playSound(name) {
    const audio = $("#sound-" + name).get(0);
    if (!audio) {
      return;
    }

    audio.currentTime = 0;
    const playback = audio.play();
    if (playback && typeof playback.catch === "function") {
      playback.catch(function (error) {
        console.warn("Could not play the " + name + " sound.", error);
      });
    }
  }

  function animatePress(color) {
    $("#" + color).addClass("pressed");
    window.setTimeout(function () {
      $("#" + color).removeClass("pressed");
    }, 100);
  }

  function playColor(color) {
    playSound(color);
    animatePress(color);
  }

  function nextSequence() {
    acceptingInput = false;
    userPattern = [];
    level += 1;
    $("#level-title").text("Level " + level);

    const nextColor = colors[Math.floor(Math.random() * colors.length)];
    gamePattern.push(nextColor);

    $.each(gamePattern, function (index, color) {
      window.setTimeout(function () {
        playColor(color);
        if (index === gamePattern.length - 1) {
          acceptingInput = true;
        }
      }, 600 * (index + 1));
    });
  }

  function startGame() {
    if (
      started ||
      !$("#quiz-panel").prop("hidden") ||
      !$("#exit-panel").prop("hidden")
    ) {
      return;
    }

    started = true;
    gamePattern = [];
    userPattern = [];
    level = 0;
    nextSequence();
  }

  function showQuestion(previousQuestion) {
    const availableQuestions = questions.filter(function (question) {
      return question !== previousQuestion;
    });
    const questionPool = availableQuestions.length > 0 ? availableQuestions : questions;
    currentQuestion = questionPool[Math.floor(Math.random() * questionPool.length)];
    $("#quiz-question").text(currentQuestion.question);
    $("#quiz-choices").empty();

    $.each(currentQuestion.answers, function (index, answer) {
      const answerId = "quiz-answer-" + index;
      const $input = $("<input>")
        .attr({ type: "radio", id: answerId, name: "quiz-answer", required: true })
        .val(answer);
      const $label = $("<label>")
        .attr("for", answerId)
        .append($input, document.createTextNode(answer));
      $("#quiz-choices").append($label);
    });

    $("#quiz-choices input").first().trigger("focus");
  }

  function showQuiz() {
    started = false;
    acceptingInput = false;

    $("#game-board").prop("hidden", true);
    $("#level-title").text("Answer a question to continue");
    $("#quiz-feedback").text("");
    $("#quiz-form").prop("hidden", false);
    $("#quiz-actions").prop("hidden", true);
    $("#quiz-panel").prop("hidden", false);
    showQuestion();
  }

  $(".btn").on("click", function () {
    if (!started || !acceptingInput) {
      return;
    }

    const clickedColor = this.id;
    userPattern.push(clickedColor);
    playColor(clickedColor);

    const currentIndex = userPattern.length - 1;
    if (userPattern[currentIndex] !== gamePattern[currentIndex]) {
      playSound("wrong");
      $("body").addClass("game-over");
      window.setTimeout(function () {
        $("body").removeClass("game-over");
      }, 200);
      showQuiz();
      return;
    }

    if (userPattern.length === gamePattern.length) {
      acceptingInput = false;
      window.setTimeout(nextSequence, 1000);
    }
  });

  $("#quiz-form").on("submit", function (event) {
    event.preventDefault();

    if ($('input[name="quiz-answer"]:checked').val() !== currentQuestion.correct) {
      $("#quiz-feedback").text("Incorrect. Try this question instead.");
      showQuestion(currentQuestion);
      return;
    }

    $("#quiz-feedback").text("Correct! Choose whether to continue or exit.");
    $("#quiz-form").prop("hidden", true);
    $("#quiz-actions").prop("hidden", false);
  });

  function startNewGame() {
    $("#quiz-panel").prop("hidden", true);
    $("#exit-panel").prop("hidden", true);
    $("#return-panel").prop("hidden", true);
    $("#game-board").prop("hidden", false);
    started = true;
    gamePattern = [];
    userPattern = [];
    level = 0;
    nextSequence();
  }

  $("#continue-game, #start-new-game").on("click", startNewGame);

  function exitGame() {
    started = false;
    acceptingInput = false;
    $("#game-board").prop("hidden", true);
    $("#quiz-panel").prop("hidden", true);
    $("#return-panel").prop("hidden", true);
    $("#exit-panel").prop("hidden", false);
    $("#level-title").text("Thanks for playing!");
  }

  $("#exit-game, #leave-game").on("click", exitGame);

  $("#back-to-game").on("click", function () {
    $("#exit-panel").prop("hidden", true);
    $("#game-board").prop("hidden", true);
    $("#return-panel").prop("hidden", false);
    started = false;
    acceptingInput = false;
    $("#level-title").text("Choose whether to play or leave");
  });

  $(document).on("keydown", function () {
    if (
      !started &&
      $("#quiz-panel").prop("hidden") &&
      $("#exit-panel").prop("hidden") &&
      $("#return-panel").prop("hidden")
    ) {
      startGame();
    }
  });
});