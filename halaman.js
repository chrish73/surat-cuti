document.addEventListener('DOMContentLoaded', () => {
    const infoForm = document.getElementById('info-form');
    
    infoForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Mencegah form dari pengiriman standar
        
        const name = document.getElementById('name').value;
        const id = document.getElementById('id').value;
        const unit = document.getElementById('unit').value;

        // Validasi sederhana
        if (!name || !id || !unit) {
            alert('Silakan lengkapi semua data.');
            return;
        }

        // Simpan data ke sessionStorage
        sessionStorage.setItem('employeeName', name);
        sessionStorage.setItem('employeeId', id);
        sessionStorage.setItem('employeeUnit', unit);

        // Arahkan ke halaman utama (index.html)
        window.location.href = 'index.html';
    });
});