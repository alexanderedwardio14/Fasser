// SheetDB configuration
const sheetDBUrl = 'https://sheetdb.io/api/v1/k5wbpcwmfkwmn';
const cacheDuration = 1 * 60 * 60 * 1000; // 1 hour in milliseconds

// Load categories and products on page load
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('category-list')) {
        const categoryList = document.getElementById('category-list');

        // Check if data is already in localStorage and not expired
        const cachedData = localStorage.getItem('products');
        const cachedTimestamp = localStorage.getItem('productsTimestamp');
        const now = new Date().getTime();

        if (cachedData && cachedTimestamp && (now - cachedTimestamp < cacheDuration)) {
            const data = JSON.parse(cachedData);
            console.log('Using cached data:', data);
            loadCategoriesAndProducts(data);
        } else {
            fetch(sheetDBUrl)
                .then(response => response.json())
                .then(data => {
                    console.log('Fetched data:', data);
                    localStorage.setItem('products', JSON.stringify(data)); // Cache data
                    localStorage.setItem('productsTimestamp', now); // Cache timestamp
                    loadCategoriesAndProducts(data);
                })
                .catch(error => {
                    console.error("Error getting documents: ", error);
                });
        }
    }

    // Check if category is specified in URL
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    if (category) {
        const cachedData = localStorage.getItem('products');
        if (cachedData) {
            const data = JSON.parse(cachedData);
            displayProductsByCategory(category, data);
        } else {
            fetch(sheetDBUrl)
                .then(response => response.json())
                .then(data => {
                    localStorage.setItem('products', JSON.stringify(data)); // Cache data
                    displayProductsByCategory(category, data);
                })
                .catch(error => {
                    console.error("Error getting documents: ", error);
                });
        }
    }
});

// Function to load categories and products
function loadCategoriesAndProducts(data) {
    const categoryList = document.getElementById('category-list');
    const categories = [...new Set(data.map(product => product.Category))];
    categories.forEach(category => {
        const categoryItem = document.createElement('a');
        categoryItem.href = `products.html?category=${category}`;
        categoryItem.innerText = category;
        categoryList.appendChild(categoryItem);
    });

    // Display all products when "Produk" is clicked
    const allProductsLink = document.getElementById('all-products-link');
    allProductsLink.addEventListener('click', function() {
        displayAllProducts(data);
    });

    // Display all products by default
    displayAllProducts(data);
}

// Function to display all products
function displayAllProducts(data) {
    const productGrid = document.getElementById('product-grid');
    productGrid.innerHTML = ''; // Clear previous products
    data.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.classList.add('product');
        productDiv.innerHTML = `
            <h3>${product.Name}</h3>
            <p>${product.Description}</p>
            <img src="${product.Image}" alt="${product.Name}">
            <button onclick="viewProductDetail('${product.ID}')">View Details</button>
        `;
        productGrid.appendChild(productDiv);
    });
}

// Function to display products by category
function displayProductsByCategory(category, data) {
    const productGrid = document.getElementById('product-grid');
    productGrid.innerHTML = ''; // Clear previous products
    const filteredProducts = data.filter(product => product.Category === category);
    filteredProducts.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.classList.add('product');
        productDiv.innerHTML = `
            <h3>${product.Name}</h3>
            <p>${product.Description}</p>
            <img src="${product.Image}" alt="${product.Name}">
            <button onclick="viewProductDetail('${product.ID}')">View Details</button>
        `;
        productGrid.appendChild(productDiv);
    });
}

// Function to redirect to product detail page
function viewProductDetail(productId) {
    window.location.href = `productdetail.html?id=${productId}`;
}

// Load product detail and display it on the product detail page
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('product-detail')) {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');

        if (productId) {
            const cachedData = localStorage.getItem('products');
            if (cachedData) {
                const data = JSON.parse(cachedData);
                const product = data.find(p => p.ID === productId);
                if (product) {
                    displayProductDetail(product);
                } else {
                    fetchProductDetail(productId);
                }
            } else {
                fetchProductDetail(productId);
            }
        }
    }
});

// Function to fetch product detail from SheetDB
function fetchProductDetail(productId) {
    fetch(`${sheetDBUrl}/search?ID=${productId}`)
        .then(response => response.json())
        .then(data => {
            console.log(data); // Log data to console
            if (data.length > 0) {
                const product = data[0];
                displayProductDetail(product);
            } else {
                console.log("No such document!");
            }
        })
        .catch(error => {
            console.log("Error getting document:", error);
        });
}

// Function to display product detail
function displayProductDetail(product) {
    document.getElementById('product-name').innerText = product.Name;
    document.getElementById('product-description').innerText = product.Description;
    //document.getElementById('product-datasheet').innerText = `Datasheet: ${product.Datasheet}`;
    document.getElementById('product-image').src = product.Image;

    // Tambahkan tombol download PDF
    const downloadButton = document.createElement('button');
    downloadButton.innerText = 'Download Datasheet';
    downloadButton.addEventListener('click', function() {
        window.open(product.Datasheet, '_blank');
    });

    // Tambahkan tombol ke elemen dengan id 'product-detail'
    const productDetail = document.getElementById('product-detail');
    productDetail.appendChild(downloadButton);
}

document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('mobile-menu');
    const navList = document.querySelector('.nav-list');
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);

    menuToggle.addEventListener('click', function() {
        navList.classList.toggle('active');
        overlay.classList.toggle('active');
    });

    overlay.addEventListener('click', function() {
        navList.classList.remove('active');
        overlay.classList.remove('active');
    });
});

document.getElementById('contactForm').addEventListener('submit', function(event) {
    var email = document.getElementById('email').value;
    var phone = document.getElementById('phone').value;
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var phonePattern = /^[0-9]{10,15}$/;

    if (!emailPattern.test(email)) {
        alert('Email tidak valid');
        event.preventDefault();
    }

    if (!phonePattern.test(phone)) {
        alert('Nomor telepon tidak valid');
        event.preventDefault();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    emailjs.init("m37UcRwm5QPpHciiS"); // YOUR_PUBLIC_KEY

    let lastSubmitTime = 0;
    const submitDelay = 30000; // 30 detik

    document.getElementById('contactForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Mencegah form submit default

        const currentTime = new Date().getTime();
        if (currentTime - lastSubmitTime < submitDelay) {
            alert('Tunggu beberapa saat sebelum mengirim lagi.');
            return;
        }

        // Ambil data form
        var templateParams = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            company: document.getElementById('company').value,
            message: document.getElementById('message').value
        };

        // Kirim email menggunakan EmailJS
        emailjs.send('service_dbx0jpp', 'template_ws4wbuk', templateParams) // service ID , template ID
            .then(function(response) {
                console.log('SUCCESS!', response.status, response.text);
                alert('Pesan berhasil dikirim ke email!');
                document.getElementById('contactForm').reset(); // Reset form setelah berhasil dikirim
                lastSubmitTime = new Date().getTime(); // Update waktu submit terakhir
            }, function(error) {
                console.log('FAILED...', error);
                alert('Pesan gagal dikirim ke email. Silakan coba lagi.');
            });

        // Kirim pesan ke WhatsApp
        var whatsappMessage = `Nama: ${templateParams.name}\nEmail: ${templateParams.email}\nNo Telepon: ${templateParams.phone}\nNama Perusahaan: ${templateParams.company}\nPesan: ${templateParams.message}`;
        var whatsappUrl = `https://wa.me/6281283299924?text=${encodeURIComponent(whatsappMessage)}`;
        window.open(whatsappUrl, '_blank');
    });
});
