document.addEventListener('DOMContentLoaded', () => {
    // Ambil data dari sessionStorage
    const name = sessionStorage.getItem('employeeName');
    const id = sessionStorage.getItem('employeeId');
    const unit = sessionStorage.getItem('employeeUnit');

    // Tampilkan data yang diterima ke elemen HTML
    if (name) {
        document.getElementById('employee-name').textContent = name;
    }
    if (id) {
        document.getElementById('employee-id').textContent = id;
    }
    if (unit) {
        document.getElementById('employee-unit').textContent = unit;
    }

    const submitButton = document.querySelector('.submit-btn');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const leaveTypeSelect = document.getElementById('leave-type');
    const reasonTextarea = document.getElementById('reason');
    const addressTextarea = document.getElementById('address');
    const fileAttachInput = document.getElementById('file-attach');
    const annualLeaveNote = document.getElementById('annual-leave-note');
    const popupModal = document.getElementById('popup-success');

    const fileUploadGroup = document.getElementById('file-upload-group');
    const fileNameDisplay = document.getElementById('file-name-display');

    const annualLeaveBody = document.getElementById('annual-leave-body');
    const otherLeaveBody = document.getElementById('other-leave-body');
    const annualLeaveRemaining = document.getElementById('annual-leave-remaining');

    let annualLeaveQuota = 12; // Jatah cuti tahunan
    let leaveHistory = []; // Array untuk menyimpan riwayat cuti

    // --- FUNGSI BARU: MEMPERBARUI TABEL RIWAYAT ---
    const updateLeaveHistoryTables = () => {
        annualLeaveBody.innerHTML = '';
        otherLeaveBody.innerHTML = '';
        let takenAnnualLeave = 0;

        leaveHistory.forEach(leave => {
            const row = document.createElement('tr');
            if (leave.leaveType === 'Cuti Tahunan') {
                takenAnnualLeave += leave.days;
                row.innerHTML = `
                    <td>${leave.submissionDate}</td>
                    <td>${leave.startDate}</td>
                    <td>${leave.endDate}</td>
                    <td>${leave.days} Hari</td>
                    <td><span class="status ${leave.status}">${leave.statusText}</span></td>
                `;
                annualLeaveBody.appendChild(row);
            } else {
                row.innerHTML = `
                    <td>${leave.leaveType}</td>
                    <td>${leave.startDate}</td>
                    <td>${leave.endDate}</td>
                    <td><span class="status ${leave.status}">${leave.statusText}</span></td>
                `;
                otherLeaveBody.appendChild(row);
            }
        });

        const remaining = annualLeaveQuota - takenAnnualLeave;
        annualLeaveRemaining.textContent = `${remaining} Hari`;
    };
    // --- AKHIR FUNGSI BARU ---

    leaveTypeSelect.addEventListener('change', () => {
        const selectedLeave = leaveTypeSelect.value;
        if (selectedLeave === 'Sakit' || selectedLeave === 'Ibadah') {
            fileUploadGroup.classList.remove('hidden');
        } else {
            fileUploadGroup.classList.add('hidden');
        }
        startDateInput.value = '';
        endDateInput.value = '';
        setStartDateLimit();
        setEndDateLimit();
    });

    fileAttachInput.addEventListener('change', () => {
        if (fileAttachInput.files.length > 0) {
            fileNameDisplay.textContent = fileAttachInput.files[0].name;
        } else {
            fileNameDisplay.textContent = 'Belum ada file dipilih';
        }
    });

    function formatDate(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function calculateDays(start, end) {
        if (!start || !end) return 0;
        const startDate = new Date(start);
        const endDate = new Date(end);
        const timeDifference = endDate.getTime() - startDate.getTime();
        const dayDifference = timeDifference / (1000 * 3600 * 24);
        return dayDifference + 1;
    }

    const setStartDateLimit = () => {
        const today = new Date();
        const minStartDate = new Date(today);
        
        if (leaveTypeSelect.value === 'Cuti Tahunan') {
            minStartDate.setDate(today.getDate() + 30);
            annualLeaveNote.classList.remove('hidden');
        } else {
            minStartDate.setDate(today.getDate());
            annualLeaveNote.classList.add('hidden');
        }
        
        startDateInput.setAttribute('min', formatDate(minStartDate));
    };

    setStartDateLimit();

    const setEndDateLimit = () => {
        const leaveType = leaveTypeSelect.value;
        const startDateValue = startDateInput.value;
        
        if (!startDateValue) {
            endDateInput.removeAttribute('min');
            endDateInput.removeAttribute('max');
            endDateInput.value = '';
            return;
        }

        const startDate = new Date(startDateValue);
        endDateInput.setAttribute('min', startDateValue);

        if (leaveType === 'Cuti Lahiran') {
            const endDate = new Date(startDate);
            endDate.setMonth(startDate.getMonth() + 3);
            endDate.setDate(endDate.getDate() - 1);
            
            endDateInput.value = formatDate(endDate);
            endDateInput.setAttribute('min', formatDate(endDate));
            endDateInput.setAttribute('max', formatDate(endDate));
            return;
        }

        let maxDays;
        switch (leaveType) {
            case 'Cuti Tahunan':
            case 'Menikah':
                maxDays = 3;
                break;
            case 'Kemalangan':
            case 'Istri Lahiran':
                maxDays = 2;
                break;
            default:
                endDateInput.removeAttribute('max');
                return;
        }

        const maxDate = new Date(startDate);
        maxDate.setDate(startDate.getDate() + (maxDays - 1));
        endDateInput.setAttribute('max', formatDate(maxDate));

        if (endDateInput.value && new Date(endDateInput.value) > maxDate) {
            endDateInput.value = '';
        }
    };

    startDateInput.addEventListener('change', setEndDateLimit);
    leaveTypeSelect.addEventListener('change', setEndDateLimit);

    submitButton.addEventListener('click', (e) => {
        e.preventDefault();

        const nameFromStorage = sessionStorage.getItem('employeeName');
        const idFromStorage = sessionStorage.getItem('employeeId');
        const unitFromStorage = sessionStorage.getItem('employeeUnit');

        if (!leaveTypeSelect.value || !startDateInput.value || !endDateInput.value || !reasonTextarea.value || !addressTextarea.value || !nameFromStorage || !idFromStorage || !unitFromStorage) {
            alert('Semua bidang harus diisi!');
            return;
        }

        const leaveType = leaveTypeSelect.value;
        const days = calculateDays(startDateInput.value, endDateInput.value);

        if (leaveType === 'Cuti Tahunan') {
            if (days > 3) {
                alert('Durasi Cuti Tahunan tidak boleh lebih dari 3 hari.');
                return;
            }
            const today = new Date();
            const minDateForAnnualLeave = new Date(today);
            minDateForAnnualLeave.setDate(today.getDate() + 30);
            if (new Date(startDateInput.value) < minDateForAnnualLeave) {
                alert('Cuti Tahunan hanya bisa diajukan minimal 30 hari dari hari ini.');
                return;
            }
            if (annualLeaveQuota - days < 0) {
                alert('Sisa cuti tahunan tidak mencukupi.');
                return;
            }
        }
        
        // --- LOGIKA BARU: MENYIMPAN RIWAYAT CUTI ---
        const newLeave = {
            leaveType: leaveType,
            startDate: startDateInput.value,
            endDate: endDateInput.value,
            days: days,
            status: 'pending',
            statusText: 'Menunggu',
            submissionDate: formatDate(new Date())
        };
        leaveHistory.push(newLeave);
        updateLeaveHistoryTables();
        // --- AKHIR LOGIKA BARU ---

        popupModal.style.display = 'flex';
        setTimeout(() => {
            popupModal.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            popupModal.classList.remove('show');
            setTimeout(() => {
                popupModal.style.display = 'none';
            }, 300);
        }, 3000);
    });
});