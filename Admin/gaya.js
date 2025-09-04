// gaya.js
// Data dummy untuk contoh
let requests = [
    {
        id: '1a',
        nama: 'Palepi Kura Kuri',
        idKaryawan: 'CGK - JK 2485',
        jenis: 'Cuti Tahunan',
        tanggalMulai: '15/09/2025',
        tanggalSelesai: '17/09/2025',
        durasi: 3, 
        jatahCutiTahunan: 12, 
        sisaCutiTahunan: 12, 
        status: 'Menunggu',
        lampiranFile: null // Tidak ada file
    },
    {
        id: '2b',
        nama: 'Budi Santoso',
        idKaryawan: 'CGK - JK 2501',
        jenis: 'Cuti Menikah',
        tanggalMulai: '10/09/2025',
        tanggalSelesai: '12/09/2025',
        durasi: 3,
        jatahCutiTahunan: 12,
        sisaCutiTahunan: 8, 
        status: 'Menunggu',
        lampiranFile: 'surat_menikah_budi.pdf' // Ada file
    },
    {
        id: '3c',
        nama: 'Siti Aminah',
        idKaryawan: 'CGK - JK 2505',
        jenis: 'Cuti Tahunan',
        tanggalMulai: '01/10/2025',
        tanggalSelesai: '01/10/2025',
        durasi: 1,
        jatahCutiTahunan: 12,
        sisaCutiTahunan: 11,
        status: 'Disetujui',
        lampiranFile: null
    },
    {
        id: '4d',
        nama: 'Joko Susilo',
        idKaryawan: 'CGK - JK 2506',
        jenis: 'Cuti Ibadah',
        tanggalMulai: '20/11/2025',
        tanggalSelesai: '21/11/2025',
        durasi: 2,
        jatahCutiTahunan: 12,
        sisaCutiTahunan: 5,
        status: 'Ditolak',
        lampiranFile: 'surat_ibadah_joko.jpg'
    }
];

// Fungsi untuk menampilkan data permohonan ke dalam tabel
function loadRequests() {
    const tableBody = document.getElementById('request-list');
    tableBody.innerHTML = '';

    requests.forEach(req => {
        const row = document.createElement('tr');
        const statusClass = req.status.toLowerCase(); 
        
        row.innerHTML = `
            <td>${req.nama}</td>
            <td>${req.idKaryawan}</td>
            <td>${req.jenis}</td>
            <td>${req.sisaCutiTahunan} Hari</td>
            <td>${req.tanggalMulai}</td>
            <td>${req.durasi} Hari</td>
            <td><div class="status-badge ${statusClass}">${req.status}</div></td>
            <td>
                ${req.lampiranFile ?
                `<button class="action-icon-btn file" onclick="viewFile('${req.lampiranFile}')" title="Lihat File">&#128196;</button>`
                : `<span class="tindakan-selesai">Tidak ada</span>`
                }
            </td>
            <td>
                ${req.status === 'Menunggu' ? 
                `<div class="action-buttons-group">
                    <button class="action-icon-btn approve" onclick="changeStatus('${req.id}', 'Disetujui')" title="Setujui">&#10003;</button>
                    <button class="action-icon-btn reject" onclick="changeStatus('${req.id}', 'Ditolak')" title="Tolak">&#10007;</button>
                </div>`
                : `<span class="tindakan-selesai">${req.status}</span>`
                }
            </td>
            <td>
                ${req.status !== 'Menunggu' ?
                `<button class="action-icon-btn edit" onclick="revertStatus('${req.id}')" title="Edit">&#9998;</button>`
                : ''
                }
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Fungsi untuk melihat file
function viewFile(fileName) {
    showNotificationPopup('info', `Simulasi: Membuka file ${fileName}`);
    // Di sini Anda bisa menambahkan logika untuk membuka file, misalnya:
    // window.open(`/path/to/your/files/${fileName}`, '_blank');
}

// Fungsi untuk mengembalikan status permohonan ke 'Menunggu'
function revertStatus(id) {
    const requestIndex = requests.findIndex(req => req.id === id);

    if (requestIndex !== -1) {
        const currentStatus = requests[requestIndex].status;
        const currentType = requests[requestIndex].jenis;
        if (currentStatus === 'Disetujui' && currentType === 'Cuti Tahunan') {
             requests[requestIndex].sisaCutiTahunan += requests[requestIndex].durasi;
        }

        requests[requestIndex].status = 'Menunggu';
        const message = `Status permohonan telah dikembalikan menjadi "Menunggu".`;
        showNotificationPopup('info', message);
        loadRequests();
    }
}

// Fungsi untuk mengubah status permohonan
function changeStatus(id, newStatus) {
    const requestIndex = requests.findIndex(req => req.id === id);

    if (requestIndex !== -1) {
        const leaveType = requests[requestIndex].jenis;
        const leaveDuration = requests[requestIndex].durasi;
        const remainingLeave = requests[requestIndex].sisaCutiTahunan;

        if (newStatus === 'Disetujui' && leaveType === 'Cuti Tahunan' && leaveDuration > remainingLeave) {
            showNotificationPopup('error', `Sisa cuti tahunan tidak mencukupi! Sisa: ${remainingLeave} hari, Durasi: ${leaveDuration} hari.`);
            return;
        }
        
        if (newStatus === 'Disetujui' && leaveType === 'Cuti Tahunan') {
            requests[requestIndex].sisaCutiTahunan -= leaveDuration;
        }

        requests[requestIndex].status = newStatus;
        
        let notificationMessage = '';
        let notificationType = '';

        if (newStatus === 'Disetujui') {
            notificationMessage = `Permohonan cuti telah disetujui!`;
            notificationType = 'success';
        } else {
            notificationMessage = `Permohonan cuti telah ditolak!`;
            notificationType = 'error';
        }
        
        showNotificationPopup(notificationType, notificationMessage);
        loadRequests();
    }
}

// Fungsi untuk menampilkan pop-up notifikasi
function showNotificationPopup(type, message) {
    const popupOverlay = document.getElementById('notification-popup');
    const popupIcon = document.getElementById('popup-icon');
    const popupTitle = document.getElementById('popup-title');
    const popupMessage = document.getElementById('popup-message');
    const popupCloseBtn = document.getElementById('popup-close-btn');

    popupIcon.className = 'popup-icon';

    if (type === 'success') {
        popupIcon.classList.add('success');
        popupTitle.textContent = 'Berhasil!';
    } else if (type === 'error') {
        popupIcon.classList.add('error');
        popupTitle.textContent = 'Ditolak!';
    } else if (type === 'info') {
        popupIcon.classList.add('info');
        popupTitle.textContent = 'Status Diperbarui';
    }

    popupMessage.textContent = message;
    popupOverlay.classList.add('show');

    popupCloseBtn.onclick = function() {
        popupOverlay.classList.remove('show');
    };

    popupOverlay.addEventListener('click', function(event) {
        if (event.target === popupOverlay) {
            popupOverlay.classList.remove('show');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadRequests();
});