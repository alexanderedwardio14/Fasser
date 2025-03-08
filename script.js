// SheetDB configuration
const sheetDBUrl = 'https://sheetdb.io/api/v1/k5wbpcwmfkwmn';
const cacheDuration = 1 * 60 * 60 * 1000; // 1 hour in milliseconds

// Function to load categories and products
function loadCategoriesAndProducts(data) {
    const categorySelect = document.getElementById('category');
    const categories = [...new Set(data.map(product => product.Category))];

    categories.forEach(category => {
        const categoryOption = document.createElement('option');
        categoryOption.value = category;
        categoryOption.innerText = category;
        categorySelect.appendChild(categoryOption);
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
        productDiv.classList.add('product-card');
        productDiv.dataset.category = product.Category;
        productDiv.innerHTML = `
            <img src="${product.Image}" alt="${product.Name}">
            <div class="product-info">
                <h1>${product.Name}</h1>
            </div>
        `;
        productDiv.addEventListener('click', function() {
            viewProductDetail(product.SpecType);
        });
        productGrid.appendChild(productDiv);
    });
}

// Function to display products by category
function displayProductsByCategory(category) {
    const cachedData = localStorage.getItem('products');
    if (cachedData) {
        const data = JSON.parse(cachedData);
        const productGrid = document.getElementById('product-grid');
        productGrid.innerHTML = ''; // Clear previous products
        const filteredProducts = data.filter(product => product.Category === category);
        filteredProducts.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.classList.add('product-card');
            productDiv.dataset.category = product.Category;
            productDiv.innerHTML = `
                <img src="${product.Image}" alt="${product.Name}">
                <div class="product-info">
                    <h1>${product.Name}</h1>
                </div>
            `;
            productDiv.addEventListener('click', function() {
                viewProductDetail(product.SpecType);
            });
            productGrid.appendChild(productDiv);
        });

        // Show product grid and hide category grid
        document.getElementById('category-grid').style.display = 'none';
        productGrid.style.display = 'grid';
    } else {
        console.error('No cached data found');
    }
}

// Function to redirect to product detail page
function viewProductDetail(productSpectype) {
    window.location.href = `productdetail.html?SpecType=${productSpectype}`;
}

// Load categories and products on page load
document.addEventListener('DOMContentLoaded', function() {
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

    // Check if category is specified in URL
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    if (category) {
        const cachedData = localStorage.getItem('products');
        if (cachedData) {
            const data = JSON.parse(cachedData);
            displayProductsByCategory(category);
        } else {
            fetch(sheetDBUrl)
                .then(response => response.json())
                .then(data => {
                    localStorage.setItem('products', JSON.stringify(data)); // Cache data
                    displayProductsByCategory(category);
                })
                .catch(error => {
                    console.error("Error getting documents: ", error);
                });
        }
    }

    // Add event listeners to category cards
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            const category = card.dataset.category;
            displayProductsByCategory(category);
        });
    });
});

// Load product detail and display it on the product detail page
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('product-detail')) {
        const urlParams = new URLSearchParams(window.location.search);
        const productSpectype = urlParams.get('SpecType');

        if (productSpectype) {
            const cachedData = localStorage.getItem('products');
            if (cachedData) {
                const data = JSON.parse(cachedData);
                const product = data.find(p => p.SpecType === productSpectype);
                if (product) {
                    displayProductDetail(product);
                } else {
                    fetchProductDetail(productSpectype);
                }
            } else {
                fetchProductDetail(productSpectype);
            }
        }
    }
});

// Function to fetch product detail from SheetDB
function fetchProductDetail(productSpectype) {
    fetch(`${sheetDBUrl}/search?SpecType=${productSpectype}`)
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
    document.getElementById('product-description').innerHTML = product.Description;
    document.getElementById('product-image').src = product.Image;

    // Tambahkan spesifikasi produk secara dinamis dalam bentuk tabel
    const productSpecs = document.getElementById('product-specs');
    productSpecs.innerHTML = '<h3>Spesifikasi Produk</h3><table class="product-specs-table"><tbody></tbody></table>';
    const specsTableBody = productSpecs.querySelector('tbody');

    for (const [key, value] of Object.entries(product)) {
        if (key.startsWith('Spec') && value) {
            const specRow = document.createElement('tr');
            specRow.innerHTML = `<th>${key.replace('Spec', '')}</th><td>${value}</td>`;
            specsTableBody.appendChild(specRow);
        }
    }

    // Tambahkan tombol download PDF
    const downloadButton = document.createElement('button');
    downloadButton.innerText = 'Download Datasheet';
    downloadButton.classList.add('button-small'); // Tambahkan kelas CSS baru
    downloadButton.addEventListener('click', function() {
        window.open(product.Datasheet, '_blank');
    });

    // Tambahkan tombol ke elemen dengan id 'product-specs'
    productSpecs.appendChild(downloadButton);

    // Tampilkan produk terkait
    displayRelatedProducts(product.Category, product.ID);
}

// Function to display related products
function displayRelatedProducts(category, currentProductId) {
    const cachedData = localStorage.getItem('products');
    if (cachedData) {
        const data = JSON.parse(cachedData);
        const relatedProducts = data.filter(product => product.Category === category && product.ID !== currentProductId);
        const relatedProductGrid = document.getElementById('related-product-grid');
        const relatedProductsSection = document.getElementById('related-products');
        
        if (relatedProducts.length === 0) {
            // Sembunyikan bagian "Produk Terkait" jika tidak ada produk terkait
            relatedProductsSection.style.display = 'none';
            return;
        }

        relatedProductGrid.innerHTML = ''; // Clear previous related products

        relatedProducts.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.classList.add('product-card');
            productDiv.dataset.category = product.Category;
            productDiv.innerHTML = `
                <img src="${product.Image}" alt="${product.Name}">
                <div class="product-info">
                    <h1>${product.Name}</h1>
                </div>
            `;
            productDiv.addEventListener('click', function() {
                viewProductDetail(product.SpecType);
            });
            relatedProductGrid.appendChild(productDiv);
        });

        // Add scroll functionality
        const scrollLeft = document.getElementById('scroll-left');
        const scrollRight = document.getElementById('scroll-right');

        scrollLeft.addEventListener('click', function() {
            relatedProductGrid.scrollBy({ left: -300, behavior: 'smooth' });
        });

        scrollRight.addEventListener('click', function() {
            relatedProductGrid.scrollBy({ left: 300, behavior: 'smooth' });
        });
    }
}





document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    const categoryListSidebar = document.getElementById('category-list-sidebar');
    const categoryCards = document.querySelectorAll('.category-card');
    const productGrid = document.getElementById('product-grid');
    const categoryGrid = document.getElementById('category-grid');

    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            const category = card.dataset.category;
            displayProductsByCategory(category);
        });
    });

    function displayProductsByCategory(category) {
        const cachedData = localStorage.getItem('products');
        if (cachedData) {
            const data = JSON.parse(cachedData);
            const filteredProducts = data.filter(product => product.Category === category);
            productGrid.innerHTML = ''; // Clear previous products

            filteredProducts.forEach(product => {
                const productDiv = document.createElement('div');
                productDiv.classList.add('product-card');
                productDiv.dataset.category = product.Category;
                productDiv.innerHTML = `
                    <img src="${product.Image}" alt="${product.Name}">
                    <div class="product-info">
                        <h1>${product.Name}</h1>
                    </div>
                `;
                productDiv.addEventListener('click', function() {
                    viewProductDetail(product.SpecType);
                });
                productGrid.appendChild(productDiv);
            });

            categoryGrid.style.display = 'none'; // Sembunyikan kategori
            productGrid.style.display = 'grid'; // Tampilkan produk
        } else {
            console.error('Tidak ada data produk di localStorage');
        }
    }

    // Function to load categories and products
    function loadCategoriesAndProducts(data) {
        const categories = [...new Set(data.map(product => product.Category))];
        categories.forEach(category => {
            const categoryItem = document.createElement('li');
            categoryItem.innerText = category;
            categoryItem.addEventListener('click', function() {
                displayProductsByCategory(category);
                markItemAsClicked(categoryItem);
            });
            categoryListSidebar.appendChild(categoryItem);

            // Add sub-items (Jenis) to the category item
            const jenisList = document.createElement('ul');
            jenisList.style.display = 'none';
            categoryItem.appendChild(jenisList);

            categoryItem.addEventListener('click', function() {
                jenisList.style.display = jenisList.style.display === 'none' ? 'block' : 'none';
            });

            const jenisItems = [...new Set(data.filter(product => product.Category === category).map(product => product.Jenis))];
            jenisItems.forEach(jenis => {
                const jenisItem = document.createElement('li');
                jenisItem.innerText = jenis;
                jenisItem.addEventListener('click', function(event) {
                    event.stopPropagation(); // Hentikan propagasi event
                    displayProductsByJenis(jenis);
                    markItemAsClicked(jenisItem);
                });
                jenisList.appendChild(jenisItem);

                // Add sub-items (Anak) to the jenis item
                const anakList = document.createElement('ul');
                anakList.style.display = 'none';
                jenisItem.appendChild(anakList);

                jenisItem.addEventListener('click', function(event) {
                    event.stopPropagation(); // Hentikan propagasi event
                    anakList.style.display = anakList.style.display === 'none' ? 'block' : 'none';
                });

                const anakItems = data.filter(product => product.Jenis === jenis).map(product => product.Anak);
                anakItems.forEach(anak => {
                    const anakItem = document.createElement('li');
                    anakItem.innerText = anak;
                    anakItem.addEventListener('click', function(event) {
                        event.stopPropagation(); // Hentikan propagasi event
                        viewProductDetailByAnak(anak);
                        markItemAsClicked(anakItem);
                    });
                    anakList.appendChild(anakItem);
                });
            });
        });
    }

    // Check if products data is available in localStorage
    const cachedData = localStorage.getItem('products');
    const cachedTimestamp = localStorage.getItem('productsTimestamp');
    const now = new Date().getTime();
    const cacheDuration = 1 * 60 * 60 * 1000; // 1 hour in milliseconds

    if (cachedData && cachedTimestamp && (now - cachedTimestamp < cacheDuration)) {
        const data = JSON.parse(cachedData);
        console.log('Using cached data:', data);
        loadCategoriesAndProducts(data);
    } else {
        fetch('https://sheetdb.io/api/v1/k5wbpcwmfkwmn')
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

    // Check if category is specified in URL
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    if (category) {
        const cachedData = localStorage.getItem('products');
        if (cachedData) {
            const data = JSON.parse(cachedData);
            displayProductsByCategory(category);
        } else {
            fetch('https://sheetdb.io/api/v1/k5wbpcwmfkwmn')
                .then(response => response.json())
                .then(data => {
                    localStorage.setItem('products', JSON.stringify(data)); // Cache data
                    displayProductsByCategory(category);
                })
                .catch(error => {
                    console.error("Error getting documents: ", error);
                });
        }
    }

    // Function to mark item as clicked
    function markItemAsClicked(item) {
        // Hapus kelas 'clicked' dari semua item
        const allItems = document.querySelectorAll('.sidebar ul li');
        allItems.forEach(i => i.classList.remove('clicked'));

        // Tambahkan kelas 'clicked' ke item yang diklik
        item.classList.add('clicked');
    }

    // Function to redirect to product detail page
    function viewProductDetail(productSpectype) {
        window.location.href = `productdetail.html?SpecType=${productSpectype}`;
    }

    // Function to display products by Jenis
    function displayProductsByJenis(jenis) {
        const cachedData = localStorage.getItem('products');
        if (cachedData) {
            const data = JSON.parse(cachedData);
            const filteredProducts = data.filter(product => product.Jenis === jenis);
            const productGrid = document.getElementById('product-grid');
            productGrid.innerHTML = ''; // Clear previous products

            filteredProducts.forEach(product => {
                const productDiv = document.createElement('div');
                productDiv.classList.add('product-card');
                productDiv.dataset.jenis = product.Jenis;
                productDiv.innerHTML = `
                    <img src="${product.Image}" alt="${product.Name}">
                    <div class="product-info">
                        <h1>${product.Name}</h1>
                    </div>
                `;
                productDiv.addEventListener('click', function() {
                    viewProductDetail(product.SpecType);
                });
                productGrid.appendChild(productDiv);
            });

            const categoryGrid = document.getElementById('category-grid');
            categoryGrid.style.display = 'none'; // Sembunyikan kategori
            productGrid.style.display = 'grid'; // Tampilkan produk
        } else {
            console.error('Tidak ada data produk di localStorage');
        }
    }

    // Function to redirect to product detail page by Anak
    function viewProductDetailByAnak(anak) {
        const cachedData = localStorage.getItem('products');
        if (cachedData) {
            const data = JSON.parse(cachedData);
            const product = data.find(product => product.Anak === anak);
            if (product) {
                viewProductDetail(product.SpecType);
            } else {
                console.error('Produk tidak ditemukan');
            }
        } else {
            console.error('Tidak ada data produk di localStorage');
        }
    }
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

// Function to send form data using EmailJS and WhatsApp
function sendFormData(formId, nameId, emailId, phoneId, companyId, messageId, lastSubmitTime, submitDelay) {
    emailjs.init("m37UcRwm5QPpHciiS"); // YOUR_PUBLIC_KEY
    const currentTime = new Date().getTime();
    if (currentTime - lastSubmitTime < submitDelay) {
        alert('Tunggu beberapa saat sebelum mengirim lagi.');
        return;
    }

    // Ambil data form
    var templateParams = {
        name: document.getElementById(nameId).value,
        email: document.getElementById(emailId).value,
        phone: document.getElementById(phoneId).value,
        company: document.getElementById(companyId).value,
        message: document.getElementById(messageId).value
    };

    // Kirim email menggunakan EmailJS
    emailjs.send('service_dbx0jpp', 'template_ws4wbuk', templateParams) // service ID , template ID
        .then(function(response) {
            console.log('SUCCESS!', response.status, response.text);
            alert('Pesan berhasil dikirim ke email!');
            document.getElementById(formId).reset(); // Reset form setelah berhasil dikirim
            lastSubmitTime = new Date().getTime(); // Update waktu submit terakhir
        }, function(error) {
            console.log('FAILED...', error);
            alert('Pesan gagal dikirim ke email. Silakan coba lagi.');
        });

    // Kirim pesan ke WhatsApp
    var whatsappMessage = `Nama: ${templateParams.name}\nEmail: ${templateParams.email}\nNo Telepon: ${templateParams.phone}\nNama Perusahaan: ${templateParams.company}\nPesan: ${templateParams.message}`;
    var whatsappUrl = `https://wa.me/6281283299924?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappUrl, '_blank');
}

// Inisialisasi EmailJS dan tambahkan event listener pada form
document.addEventListener('DOMContentLoaded', function() {
    let lastSubmitTime = 0;
    const submitDelay = 30000; // 30 detik

    document.getElementById('contactForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Mencegah form submit default
        sendFormData('contactForm', 'name', 'email', 'phone', 'company', 'message', lastSubmitTime, submitDelay);
    });

    document.getElementById('helpContactForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Mencegah form submit default
        sendFormData('helpContactForm', 'help-name', 'help-email', 'help-phone', 'help-company', 'help-message', lastSubmitTime, submitDelay);
    });

    // Load categories and products on page load
    const cachedData = localStorage.getItem('products');
    const cachedTimestamp = localStorage.getItem('productsTimestamp');
    const now = new Date().getTime();
    const cacheDuration = 1 * 60 * 60 * 1000; // 1 hour in milliseconds

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

    // Check if category is specified in URL
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    if (category) {
        const cachedData = localStorage.getItem('products');
        if (cachedData) {
            const data = JSON.parse(cachedData);
            displayProductsByCategory(category);
        } else {
            fetch(sheetDBUrl)
                .then(response => response.json())
                .then(data => {
                    localStorage.setItem('products', JSON.stringify(data)); // Cache data
                    displayProductsByCategory(category);
                })
                .catch(error => {
                    console.error("Error getting documents: ", error);
                });
        }
    }

    // Add event listeners to category cards
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            const category = card.dataset.category;
            displayProductsByCategory(category);
        });
    });

    // Load product detail and display it on the product detail page
    if (document.getElementById('product-detail')) {
        const urlParams = new URLSearchParams(window.location.search);
        const productSpectype = urlParams.get('SpecType');

        if (productSpectype) {
            const cachedData = localStorage.getItem('products');
            if (cachedData) {
                const data = JSON.parse(cachedData);
                const product = data.find(p => p.SpecType === productSpectype);
                if (product) {
                    displayProductDetail(product);
                } else {
                    fetchProductDetail(productSpectype);
                }
            } else {
                fetchProductDetail(productSpectype);
            }
        }
    }
});

// Function to display products by Jenis
function displayProductsByJenis(jenis) {
    const cachedData = localStorage.getItem('products');
    if (cachedData) {
        const data = JSON.parse(cachedData);
        const filteredProducts = data.filter(product => product.Jenis === jenis);
        const productGrid = document.getElementById('product-grid');
        productGrid.innerHTML = ''; // Clear previous products

        filteredProducts.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.classList.add('product-card');
            productDiv.dataset.jenis = product.Jenis;
            productDiv.innerHTML = `
                <img src="${product.Image}" alt="${product.Name}">
                <div class="product-info">
                    <h1>${product.Name}</h1>
                </div>
            `;
            productDiv.addEventListener('click', function() {
                viewProductDetail(product.SpecType);
            });
            productGrid.appendChild(productDiv);
        });

        const categoryGrid = document.getElementById('category-grid');
        categoryGrid.style.display = 'none'; // Sembunyikan kategori
        productGrid.style.display = 'grid'; // Tampilkan produk
    } else {
        console.error('Tidak ada data produk di localStorage');
    }
}

// Function to redirect to product detail page by Anak
function viewProductDetailByAnak(anak) {
    const cachedData = localStorage.getItem('products');
    if (cachedData) {
        const data = JSON.parse(cachedData);
        const product = data.find(product => product.Anak === anak);
        if (product) {
            viewProductDetail(product.SpecType);
        } else {
            console.error('Produk tidak ditemukan');
        }
    } else {
        console.error('Tidak ada data produk di localStorage');
    }
}


