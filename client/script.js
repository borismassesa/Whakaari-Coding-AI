import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

// // JavaScript code to add copy functionality to the copy button
// const copyButton = document.querySelector(".copy-button");

// copyButton.addEventListener("click", () => {
//   // Select the text in the code element
//   const codeElement = document.querySelector("#chat_container");
//   codeElement.select();

//   // Copy the selected text to the clipboard
//   document.execCommand("copy");

//   // Alert the user that the code has been copied
//   alert("Code copied to clipboard");
// });

// chatContainer.addEventListener("click", () => {
//   // Check if the chat message contains code

//   // Show or hide the copy button based on the presence of code
//   if (chatContainer) {
//     copyButton.style.display = "block";
//   } else {
//     copyButton.style.display = "none";
//   }
// });


let loadInterval


function loader(element) {
    element.textContent = ''

    loadInterval = setInterval(() => {
        // Update the text content of the loading indicator
        element.textContent += '.';

        // If the loading indicator has reached three dots, reset it
        if (element.textContent === '....') {
            element.textContent = '';
        }
    }, 300);
}

function typeText(element, text) {
  let index = 0

  let interval = setInterval(() => {
      if (index < text.length) {
          element.innerHTML += text.charAt(index)
          index++
      } else {
          clearInterval(interval)
      }
  }, 20)
}

// generate unique ID for each message div of bot
// necessary for typing text effect for that specific reply
// without unique ID, typing text will work on every element
function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}


function chatStripe(isAi, value, uniqueId) {
  return (
      `
      <div class="wrapper ${isAi && 'ai'}">
          <div class="chat">
              <div class="profile">
                  <img 
                    src=${isAi ? bot : user} 
                    alt="${isAi ? 'bot' : 'user'}" 
                  />
              </div>
              <div class="message" id=${uniqueId}>${value}</div>
          </div>
      </div>
  `
  )
}

// function describeCode(code) {
//   // Use OpenAI's ChatGPT to generate a description of the code
//   const description = generateDescription(code);
  
//   // Return the description along with the code
//   return `Code: \n${code}\nDescription: \n${description}`;
// }

// async function generateDescription(code) {
//   // Set up the request to the OpenAI API
//   const endpoint = "https://whakaari-codeai.onrender.com";
//   const apiKey = "OPENAI_API_KEY";
//   const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` };
//   const data = { "model": "chatGPT", "prompt": code };

//   // Send the request to the OpenAI API
//   const response = await fetch(endpoint, { method: "POST", headers: headers, body: JSON.stringify(data) });
//   const json = await response.json();

//   // Extract the description from the response
//   return json.description;
// }


  const handleSubmit = async (e) => {
    e.preventDefault()
  
    const data = new FormData(form)
  
    // user's chatstripe
    chatContainer.innerHTML += chatStripe(false, data.get('prompt'))
  
    // to clear the textarea input 
    form.reset()
  
    // bot's chatstripe
    const uniqueId = generateUniqueId()
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId)
  
    // to focus scroll to the bottom 
    chatContainer.scrollTop = chatContainer.scrollHeight;
    // specific message div 
    const messageDiv = document.getElementById(uniqueId)

    // messageDiv.innerHTML = "..."
    loader(messageDiv)

    // fetch data from the server  to -> bot's response

    const response = await fetch('https://whakaari-codeai.onrender.com', {
      method: 'POST' ,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: data.get('prompt')
      })

    })
    clearInterval(loadInterval)
    messageDiv.innerHTML = " "

    if (response.ok) {
        const data = await response.json();
        const parsedData = data.bot.trim() // trims any trailing spaces/'\n' 

        typeText(messageDiv, parsedData)
    } else {
        const err = await response.text()

        messageDiv.innerHTML = "Something went wrong"
        alert(err)
    }
  
}

form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        handleSubmit(e)
    }
})