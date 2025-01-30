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
    emailjs.init("PWPeDwVXYMaN0piTj"); // YOUR_PUBLIC_KEY

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
            message: document.getElementById('message').value
        };

        // Kirim email menggunakan EmailJS
        emailjs.send('service_zse6nc3', 'template_mn9o9s8', templateParams) // service ID , template ID
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
        var whatsappMessage = `Nama: ${templateParams.name}\nEmail: ${templateParams.email}\nNo Telepon: ${templateParams.phone}\nPesan: ${templateParams.message}`;
        var whatsappUrl = `https://wa.me/08998253588?text=${encodeURIComponent(whatsappMessage)}`;
        window.open(whatsappUrl, '_blank');
    });
});