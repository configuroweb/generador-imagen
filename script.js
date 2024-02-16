const generateForm = document.querySelector(".generate-form");
const generateBtn = generateForm.querySelector(".generate-btn");
const imageGallery = document.querySelector(".image-gallery");

const OPENAI_API_KEY = "tu token"; // tu token acá
let isImageGenerating = false;

const updateImageCard = (imgDataArray) => {
  if (!Array.isArray(imgDataArray)) {
    console.error("imgDataArray is not an array:", imgDataArray);
    return;
  }

  imgDataArray.forEach((imgObject, index) => {
    const imgCard = imageGallery.querySelectorAll(".img-card")[index];
    if (!imgCard) {
      console.error("No se encontró ninguna tarjeta imgCard para el índice: ", index);
      return;
    }
    const imgElement = imgCard.querySelector("img");

    if (!imgElement) {
      console.error("No se encontró ningún elemento img en imgCard: ", imgCard);
      return;
    }

    // Utilizar la URL de la imagen directamente
    imgElement.src = imgObject.url;

    // Intentar encontrar el botón de descarga dentro de la tarjeta de imagen
    const downloadBtn = imgCard.querySelector("a.download-btn");
    if (downloadBtn) {
      imgElement.onload = () => {
        imgCard.classList.remove("loading");
        downloadBtn.setAttribute("href", imgObject.url);
        downloadBtn.setAttribute("download", `AI_Image_${new Date().getTime()}.png`); // Asumiendo que las imágenes son PNG
      }
    } else {
      imgElement.onload = () => {
        imgCard.classList.remove("loading");
      }
    }
  });
}

const generateAiImages = async (userPrompt, userImgQuantity) => {
  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: userPrompt,
        n: userImgQuantity,
      }),
    });

    if (!response.ok) throw new Error("Failed to generate AI images. Make sure your API key is valid.");

    const { data } = await response.json();

    // Asegurándose de que pasamos el arreglo correcto a updateImageCard
    if (data && Array.isArray(data)) {
      updateImageCard(data); // data es el arreglo que contiene las URLs de las imágenes
    } else {
      console.error("Unexpected response structure:", data);
    }
  } catch (error) {
    alert(error.message);
  } finally {
    generateBtn.removeAttribute("disabled");
    generateBtn.innerText = "Generate";
    isImageGenerating = false;
  }
}

const handleImageGeneration = (e) => {
  e.preventDefault();
  if(isImageGenerating) return;

  // Get user input and image quantity values
  const userPrompt = e.srcElement[0].value;
  const userImgQuantity = parseInt(e.srcElement[1].value);
  
  // Disable the generate button, update its text, and set the flag
  generateBtn.setAttribute("disabled", true);
  generateBtn.innerText = "Generating";
  isImageGenerating = true;
  
  // Creating HTML markup for image cards with loading state
  const imgCardMarkup = Array.from({ length: userImgQuantity }, () => 
      `<div class="img-card loading">
        <img src="images/loader.svg" alt="AI generated image">
        <a class="download-btn" href="#">
          <img src="images/download.svg" alt="download icon">
        </a>
      </div>`
  ).join("");

  imageGallery.innerHTML = imgCardMarkup;
  generateAiImages(userPrompt, userImgQuantity);
}

generateForm.addEventListener("submit", handleImageGeneration);