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

    // Bagian kode lain tetap sama
    const submitButton = document.querySelector('.submit-btn');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const leaveTypeSelect = document.getElementById('leave-type');
    const reasonTextarea = document.getElementById('reason');
    const annualLeaveNote = document.getElementById('annual-leave-note');
    const popupModal = document.getElementById('popup-success');

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
    leaveTypeSelect.addEventListener('change', () => {
        startDateInput.value = '';
        endDateInput.value = '';
        setStartDateLimit();
    });

    const setEndDateLimit = () => {
        if (startDateInput.value) {
            endDateInput.setAttribute('min', startDateInput.value);
            if (endDateInput.value && new Date(endDateInput.value) < new Date(startDateInput.value)) {
                endDateInput.value = '';
            }
        } else {
            endDateInput.removeAttribute('min');
        }

        if (leaveTypeSelect.value === 'Cuti Tahunan' && startDateInput.value) {
            const startDate = new Date(startDateInput.value);
            const maxDate = new Date(startDate);
            maxDate.setDate(startDate.getDate() + 2);
            endDateInput.setAttribute('max', formatDate(maxDate));
        } else {
            endDateInput.removeAttribute('max');
        }
    };

    startDateInput.addEventListener('change', setEndDateLimit);

    submitButton.addEventListener('click', (e) => {
        e.preventDefault();

        // Mengambil data dari sessionStorage
        const nameFromStorage = sessionStorage.getItem('employeeName');
        const idFromStorage = sessionStorage.getItem('employeeId');
        const unitFromStorage = sessionStorage.getItem('employeeUnit');

        if (!leaveTypeSelect.value || !startDateInput.value || !endDateInput.value || !reasonTextarea.value || !nameFromStorage || !idFromStorage || !unitFromStorage) {
            alert('Semua bidang harus diisi!');
            return;
        }

        if (leaveTypeSelect.value === 'Cuti Tahunan') {
            const days = calculateDays(startDateInput.value, endDateInput.value);
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
        }

        // Tampilkan pop-up setelah validasi sukses
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