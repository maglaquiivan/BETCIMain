// Form state management
let isDrawing = false;
let signatureImage = null;
let pictureImage = null;
let admissionPictureImage = null;
const AUTO_SAVE_KEY = 'caate_application_form_data';

// Initialize form on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    setupValidation();
    setupSignatureCanvas();
    setupAgeCalculation();
    setupPictureUploads();
    setupFormSubmission();
    setupAutoSave();
    loadSavedData();
    setupFieldRecommendations();
    updateAdmissionSlipOnChange();
    setupNavbar();
    // Ensure print template boxes are ready
    initializePrintTemplate();
});

// Setup Navbar
function setupNavbar() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Mobile menu toggle
    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
            const icon = this.querySelector('i');
            if (mobileMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
        // Close mobile menu when clicking a link
        mobileMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function() {
                mobileMenu.classList.remove('active');
                const icon = mobileMenuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!mobileMenu.contains(event.target) && !mobileMenuToggle.contains(event.target)) {
                mobileMenu.classList.remove('active');
                const icon = mobileMenuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
    
    // Active link on scroll
    const sections = document.querySelectorAll('section, .container');
    window.addEventListener('scroll', function() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= sectionTop - 100) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });
    
    // Smooth scroll for nav links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const offsetTop = target.offsetTop - 100;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// Initialize form
function initializeForm() {
    setupReferenceNumber();
    populateAdmissionSlip();
    
    // Add helpful tooltips and recommendations
    addFieldRecommendations();
}

// Auto-save functionality to prevent data loss
function setupAutoSave() {
    const form = document.getElementById('applicationForm');
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        // Skip file inputs and readonly fields for auto-save
        if (input.type === 'file' || input.readOnly) return;
        
        input.addEventListener('input', debounce(function() {
            saveFormData();
        }, 1000));
        
        input.addEventListener('change', function() {
            saveFormData();
        });
    });
    
    // Auto-save signature
    const canvas = document.getElementById('signatureCanvas');
    if (canvas) {
        let saveInterval = setInterval(() => {
            if (isDrawing || signatureImage) {
                saveFormData();
            }
        }, 2000);
    }
}

// Debounce function to limit auto-save frequency
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Save form data to localStorage
function saveFormData() {
    try {
        const formData = {
            // Reference number
            referenceQualifiable: document.getElementById('referenceQualifiable')?.value || '',
            referenceYY: document.getElementById('referenceYY')?.value || '',
            referenceRegion: document.getElementById('referenceRegion')?.value || '',
            referenceProvince: document.getElementById('referenceProvince')?.value || '',
            referenceNumber: document.getElementById('referenceNumber')?.value || '',
            referenceSeries: document.getElementById('referenceSeries')?.value || '',
            
            // Application info
            schoolName: document.getElementById('schoolName')?.value || '',
            schoolAddress: document.getElementById('schoolAddress')?.value || '',
            assessmentTitle: document.getElementById('assessmentTitle')?.value || '',
            assessmentType: document.querySelector('input[name="assessmentType"]:checked')?.value || '',
            clientType: document.querySelector('input[name="clientType"]:checked')?.value || '',
            applicationDate: document.getElementById('applicationDate')?.value || '',
            
            // Profile
            surname: document.getElementById('surname')?.value || '',
            firstname: document.getElementById('firstname')?.value || '',
            middleName: document.getElementById('middleName')?.value || '',
            middleInitial: document.getElementById('middleInitial')?.value || '',
            nameExtension: document.getElementById('nameExtension')?.value || '',
            
            // Address
            mailingNumber: document.getElementById('mailingNumber')?.value || '',
            barangay: document.getElementById('barangay')?.value || '',
            district: document.getElementById('district')?.value || '',
            city: document.getElementById('city')?.value || '',
            province: document.getElementById('province')?.value || '',
            region: document.getElementById('region')?.value || '',
            zip: document.getElementById('zip')?.value || '',
            
            // Personal info
            mothersName: document.getElementById('mothersName')?.value || '',
            fathersName: document.getElementById('fathersName')?.value || '',
            sex: document.querySelector('input[name="sex"]:checked')?.value || '',
            civilStatus: document.querySelector('input[name="civilStatus"]:checked')?.value || '',
            tel: document.getElementById('tel')?.value || '',
            mobile: document.getElementById('mobile')?.value || '',
            email: document.getElementById('email')?.value || '',
            fax: document.getElementById('fax')?.value || '',
            otherContact: document.getElementById('otherContact')?.value || '',
            education: document.querySelector('input[name="education"]:checked')?.value || '',
            employmentStatus: document.querySelector('input[name="employmentStatus"]:checked')?.value || '',
            birthDate: document.getElementById('birthDate')?.value || '',
            birthPlace: document.getElementById('birthPlace')?.value || '',
            age: document.getElementById('age')?.value || '',
            
            // Signature
            signature: signatureImage || null,
            picture: pictureImage || null,
            admissionPicture: admissionPictureImage || null,
            
            // Admission slip
            officialReceipt: document.getElementById('officialReceipt')?.value || '',
            dateIssued: document.getElementById('dateIssued')?.value || '',
            assessmentCenter: document.getElementById('assessmentCenter')?.value || '',
            assessmentDate: document.getElementById('assessmentDate')?.value || '',
            assessmentTime: document.getElementById('assessmentTime')?.value || '',
            remarks: document.getElementById('remarks')?.value || '',
            officerName: document.getElementById('officerName')?.value || '',
            officerDate: document.getElementById('officerDate')?.value || '',
            
            // Requirements checkboxes
            requirements: Array.from(document.querySelectorAll('input[name="requirements[]"]:checked')).map(cb => cb.value),
            otherRequirements: document.getElementById('otherRequirements')?.value || '',
            
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(formData));
        showAutoSaveIndicator();
    } catch (error) {
        console.error('Error saving form data:', error);
    }
}

// Load saved data from localStorage
function loadSavedData() {
    try {
        const savedData = localStorage.getItem(AUTO_SAVE_KEY);
        if (!savedData) return;
        
        const formData = JSON.parse(savedData);
        const confirmLoad = confirm('We found previously saved data. Would you like to continue from where you left off?');
        
        if (confirmLoad) {
            // Restore form fields
            Object.keys(formData).forEach(key => {
                if (key === 'signature' && formData[key]) {
                    signatureImage = formData[key];
                    const canvas = document.getElementById('signatureCanvas');
                    if (canvas && signatureImage) {
                        const ctx = canvas.getContext('2d');
                        const img = new Image();
                        img.onload = function() {
                            ctx.drawImage(img, 0, 0);
                        };
                        img.src = signatureImage;
                    }
                } else if (key === 'picture' && formData[key]) {
                    pictureImage = formData[key];
                    const preview = document.getElementById('picturePreview');
                    const placeholder = document.getElementById('picturePlaceholder');
                    if (preview && placeholder) {
                        preview.src = pictureImage;
                        preview.style.display = 'block';
                        placeholder.style.display = 'none';
                    }
                } else if (key === 'admissionPicture' && formData[key]) {
                    admissionPictureImage = formData[key];
                    const preview = document.getElementById('admissionPicturePreview');
                    const placeholder = document.getElementById('admissionPicturePlaceholder');
                    if (preview && placeholder) {
                        preview.src = admissionPictureImage;
                        preview.style.display = 'block';
                        placeholder.style.display = 'none';
                    }
                } else if (key === 'requirements') {
                    formData[key].forEach(value => {
                        const checkbox = document.querySelector(`input[name="requirements[]"][value="${value}"]`);
                        if (checkbox) checkbox.checked = true;
                    });
                } else if (key !== 'timestamp') {
                    const element = document.getElementById(key) || document.querySelector(`input[name="${key}"]`);
                    if (element && element.type !== 'file') {
                        if (element.type === 'radio' || element.type === 'checkbox') {
                            if (element.value === formData[key]) {
                                element.checked = true;
                            }
                        } else {
                            element.value = formData[key] || '';
                        }
                    }
                }
            });
            
            // Trigger change events to update dependent fields
            if (formData.birthDate) {
                calculateAge(formData.birthDate);
            }
            updateReferenceNumber();
            populateAdmissionSlip();
            buildPrintLayout();
            
            showNotification('Form data restored successfully!', 'success');
        }
    } catch (error) {
        console.error('Error loading saved data:', error);
    }
}

// Show auto-save indicator
function showAutoSaveIndicator() {
    let indicator = document.getElementById('autoSaveIndicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'autoSaveIndicator';
        indicator.style.cssText = 'position: fixed; bottom: 20px; right: 20px; background: #28a745; color: white; padding: 10px 20px; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 1000; font-size: 0.9rem; display: none;';
        document.body.appendChild(indicator);
    }
    
    indicator.textContent = '✓ Auto-saved';
    indicator.style.display = 'block';
    
    setTimeout(() => {
        indicator.style.display = 'none';
    }, 2000);
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-weight: 500;
        animation: slideIn 0.3s ease;
    `;
    
    const colors = {
        success: { bg: '#28a745', color: 'white' },
        error: { bg: '#dc3545', color: 'white' },
        info: { bg: '#1a5490', color: 'white' },
        warning: { bg: '#ffc107', color: '#333' }
    };
    
    const style = colors[type] || colors.info;
    notification.style.background = style.bg;
    notification.style.color = style.color;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Setup Reference Number
function setupReferenceNumber() {
    const referenceInputs = document.querySelectorAll('.reference-input-group input');
    referenceInputs.forEach(input => {
        input.addEventListener('input', function() {
            updateReferenceNumber();
            saveFormData();
        });
        
        // Auto-uppercase
        input.addEventListener('input', function() {
            this.value = this.value.toUpperCase();
        });
    });
}

function updateReferenceNumber() {
    const qualifiable = document.getElementById('referenceQualifiable')?.value || '';
    const yy = document.getElementById('referenceYY')?.value || '';
    const region = document.getElementById('referenceRegion')?.value || '';
    const province = document.getElementById('referenceProvince')?.value || '';
    const number = document.getElementById('referenceNumber')?.value || '';
    const series = document.getElementById('referenceSeries')?.value || '';
    
    const fullReference = `${qualifiable}${yy}${region}${province}${number}${series}`;
    
    // Update admission slip individual fields
    if (document.getElementById('admissionReferenceQualifiable')) {
        document.getElementById('admissionReferenceQualifiable').value = qualifiable;
    }
    if (document.getElementById('admissionReferenceYY')) {
        document.getElementById('admissionReferenceYY').value = yy;
    }
    if (document.getElementById('admissionReferenceRegion')) {
        document.getElementById('admissionReferenceRegion').value = region;
    }
    if (document.getElementById('admissionReferenceProvince')) {
        document.getElementById('admissionReferenceProvince').value = province;
    }
    if (document.getElementById('admissionReferenceNumber')) {
        document.getElementById('admissionReferenceNumber').value = number;
    }
    if (document.getElementById('admissionReferenceSeries')) {
        document.getElementById('admissionReferenceSeries').value = series;
    }
}

// Setup Picture Uploads
function setupPictureUploads() {
    const picturePlaceholder = document.getElementById('picturePlaceholder');
    const pictureInput = document.getElementById('picture');
    
    if (picturePlaceholder && pictureInput) {
        picturePlaceholder.addEventListener('click', () => {
            pictureInput.click();
        });
    }
    
    const admissionPicturePlaceholder = document.getElementById('admissionPicturePlaceholder');
    const admissionPictureInput = document.getElementById('admissionPicture');
    
    if (admissionPicturePlaceholder && admissionPictureInput) {
        admissionPicturePlaceholder.addEventListener('click', () => {
            admissionPictureInput.click();
        });
    }
}

function handlePictureUpload(event) {
    const file = event.target.files[0];
    if (file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            showNotification('Please upload an image file only.', 'error');
            return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showNotification('Image size should be less than 5MB.', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('picturePreview');
            const placeholder = document.getElementById('picturePlaceholder');
            preview.src = e.target.result;
            preview.style.display = 'block';
            placeholder.style.display = 'none';
            pictureImage = e.target.result;
            saveFormData();
        };
        reader.readAsDataURL(file);
    }
}

function handleAdmissionPictureUpload(event) {
    const file = event.target.files[0];
    if (file) {
        if (!file.type.startsWith('image/')) {
            showNotification('Please upload an image file only.', 'error');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            showNotification('Image size should be less than 5MB.', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('admissionPicturePreview');
            const placeholder = document.getElementById('admissionPicturePlaceholder');
            preview.src = e.target.result;
            preview.style.display = 'block';
            placeholder.style.display = 'none';
            admissionPictureImage = e.target.result;
            saveFormData();
        };
        reader.readAsDataURL(file);
    }
}

// Setup Signature Canvas
function setupSignatureCanvas() {
    const canvas = document.getElementById('signatureCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Touch events for mobile
    canvas.addEventListener('touchstart', handleTouch);
    canvas.addEventListener('touchmove', handleTouch);
    canvas.addEventListener('touchend', stopDrawing);
}

function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const canvas = document.getElementById('signatureCanvas');
    const rect = canvas.getBoundingClientRect();
    const mouseEvent = new MouseEvent(e.type === 'touchstart' ? 'mousedown' : 'mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}

function startDrawing(e) {
    isDrawing = true;
    const canvas = document.getElementById('signatureCanvas');
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    const x = e.clientX ? e.clientX - rect.left : e.touches[0].clientX - rect.left;
    const y = e.clientY ? e.clientY - rect.top : e.touches[0].clientY - rect.top;
    ctx.moveTo(x, y);
}

function draw(e) {
    if (!isDrawing) return;
    const canvas = document.getElementById('signatureCanvas');
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX ? e.clientX - rect.left : (e.touches ? e.touches[0].clientX - rect.left : 0);
    const y = e.clientY ? e.clientY - rect.top : (e.touches ? e.touches[0].clientY - rect.top : 0);
    ctx.lineTo(x, y);
    ctx.stroke();
}

function stopDrawing() {
    if (isDrawing) {
        const canvas = document.getElementById('signatureCanvas');
        const ctx = canvas.getContext('2d');
        signatureImage = canvas.toDataURL();
        isDrawing = false;
        saveFormData();
    }
}

function clearSignature() {
    const canvas = document.getElementById('signatureCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    signatureImage = null;
    saveFormData();
}

// Setup Age Calculation
function setupAgeCalculation() {
    const birthDateInput = document.getElementById('birthDate');
    if (birthDateInput) {
        birthDateInput.addEventListener('change', function() {
            calculateAge(this.value);
            saveFormData();
        });
    }
}

function calculateAge(birthDate) {
    if (!birthDate) return;
    
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    const ageInput = document.getElementById('age');
    if (ageInput) {
        ageInput.value = age;
    }
}

// Setup Field Recommendations
function setupFieldRecommendations() {
    // Common Philippine regions
    const regions = ['NCR', 'CAR', 'Region I', 'Region II', 'Region III', 'Region IV-A', 'Region IV-B', 'Region V', 'Region VI', 'Region VII', 'Region VIII', 'Region IX', 'Region X', 'Region XI', 'Region XII', 'CARAGA', 'ARMM'];
    
    // Common provinces (examples)
    const provinces = ['Metro Manila', 'Cavite', 'Laguna', 'Batangas', 'Rizal', 'Quezon', 'Bulacan', 'Pampanga', 'Cebu', 'Davao'];
    
    setupAutocomplete('region', regions);
    setupAutocomplete('province', provinces);
    
    // Email validation with suggestion
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            const email = this.value.trim();
            if (email && !email.includes('@')) {
                showFieldRecommendation(this, 'Please include @ symbol in email address (e.g., name@email.com)');
            } else if (email && !email.includes('.')) {
                showFieldRecommendation(this, 'Email should have a domain (e.g., name@email.com)');
            }
        });
    }
    
    // Phone number formatting
    const mobileInput = document.getElementById('mobile');
    if (mobileInput) {
        mobileInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            if (value.length > 0 && !value.startsWith('09') && !value.startsWith('63')) {
                showFieldRecommendation(this, 'Philippine mobile numbers usually start with 09 or 63');
            }
            if (value.length === 11 && value.startsWith('09')) {
                this.value = value.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3');
            }
        });
    }
}

// Setup autocomplete
function setupAutocomplete(fieldId, suggestions) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    let autocompleteList = null;
    
    field.addEventListener('input', function() {
        const value = this.value.toLowerCase();
        const matches = suggestions.filter(s => s.toLowerCase().includes(value));
        
        if (matches.length > 0 && value.length > 0) {
            showAutocompleteSuggestions(this, matches);
        } else {
            hideAutocompleteSuggestions();
        }
    });
    
    field.addEventListener('blur', function() {
        setTimeout(() => hideAutocompleteSuggestions(), 200);
    });
}

function showAutocompleteSuggestions(field, suggestions) {
    hideAutocompleteSuggestions();
    
    const list = document.createElement('ul');
    list.className = 'autocomplete-suggestions';
    list.style.cssText = `
        position: absolute;
        background: white;
        border: 2px solid #1a5490;
        border-radius: 6px;
        max-height: 200px;
        overflow-y: auto;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        list-style: none;
        padding: 0;
        margin: 0;
    `;
    
    suggestions.slice(0, 5).forEach(suggestion => {
        const item = document.createElement('li');
        item.textContent = suggestion;
        item.style.cssText = 'padding: 10px 15px; cursor: pointer; border-bottom: 1px solid #e9ecef;';
        item.addEventListener('mouseenter', function() {
            this.style.background = '#f0f7ff';
        });
        item.addEventListener('mouseleave', function() {
            this.style.background = 'white';
        });
        item.addEventListener('click', function() {
            field.value = suggestion;
            hideAutocompleteSuggestions();
            field.dispatchEvent(new Event('input'));
        });
        list.appendChild(item);
    });
    
    const rect = field.getBoundingClientRect();
    list.style.top = (rect.bottom + window.scrollY) + 'px';
    list.style.left = (rect.left + window.scrollX) + 'px';
    list.style.width = rect.width + 'px';
    
    document.body.appendChild(list);
}

function hideAutocompleteSuggestions() {
    const existing = document.querySelector('.autocomplete-suggestions');
    if (existing) existing.remove();
}

function showFieldRecommendation(field, message) {
    let recommendation = field.parentElement.querySelector('.field-recommendation');
    if (!recommendation) {
        recommendation = document.createElement('div');
        recommendation.className = 'field-recommendation';
        recommendation.style.cssText = `
            margin-top: 5px;
            padding: 8px 12px;
            background: #fff3cd;
            border-left: 3px solid #ffc107;
            border-radius: 4px;
            font-size: 0.85rem;
            color: #856404;
        `;
        field.parentElement.appendChild(recommendation);
    }
    recommendation.textContent = message;
    
    setTimeout(() => {
        recommendation.remove();
    }, 5000);
}

function addFieldRecommendations() {
    // Add helpful hints to form fields
    const hints = {
        'surname': 'Enter your family name',
        'firstname': 'Enter your given name',
        'mobile': 'Format: 09XX XXX XXXX or 63XXX XXX XXXX',
        'email': 'Format: name@example.com',
        'zip': 'Philippine ZIP codes are usually 4 digits',
        'birthDate': 'Age will be calculated automatically'
    };
    
    Object.keys(hints).forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.setAttribute('placeholder', hints[fieldId]);
            field.setAttribute('title', hints[fieldId]);
        }
    });
}

// Update Admission Slip on field changes
function updateAdmissionSlipOnChange() {
    const fieldsToWatch = ['surname', 'firstname', 'middleName', 'mobile', 'tel', 'assessmentTitle'];
    
    fieldsToWatch.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', populateAdmissionSlip);
            field.addEventListener('change', populateAdmissionSlip);
        }
    });
    
    // Watch radio buttons
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', populateAdmissionSlip);
    });
}

// Dynamic Table Row Functions
function addWorkRow() {
    const tbody = document.getElementById('workExperienceBody');
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="text" name="workCompany[]"></td>
        <td><input type="text" name="workPosition[]"></td>
        <td><input type="text" name="workDates[]" placeholder="MM/YYYY - MM/YYYY"></td>
        <td><input type="text" name="workSalary[]"></td>
        <td><input type="text" name="workStatus[]"></td>
        <td><input type="number" name="workYears[]" step="0.1"></td>
        <td><button type="button" class="btn-remove" onclick="removeWorkRow(this)">Remove</button></td>
    `;
    tbody.appendChild(row);
    
    // Setup auto-save for new row
    row.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', debounce(saveFormData, 1000));
    });
}

function removeWorkRow(button) {
    const tbody = document.getElementById('workExperienceBody');
    if (tbody.children.length > 1) {
        button.closest('tr').remove();
        saveFormData();
    } else {
        showNotification('You must have at least one row. Clear the fields instead.', 'warning');
    }
}

function addTrainingRow() {
    const tbody = document.getElementById('trainingBody');
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="text" name="trainingTitle[]"></td>
        <td><input type="text" name="trainingVenue[]"></td>
        <td><input type="text" name="trainingDates[]" placeholder="MM/YYYY - MM/YYYY"></td>
        <td><input type="number" name="trainingHours[]"></td>
        <td><input type="text" name="trainingConductedBy[]"></td>
        <td><button type="button" class="btn-remove" onclick="removeTrainingRow(this)">Remove</button></td>
    `;
    tbody.appendChild(row);
    
    row.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', debounce(saveFormData, 1000));
    });
}

function removeTrainingRow(button) {
    const tbody = document.getElementById('trainingBody');
    if (tbody.children.length > 1) {
        button.closest('tr').remove();
        saveFormData();
    } else {
        showNotification('You must have at least one row. Clear the fields instead.', 'warning');
    }
}

function addLicensureRow() {
    const tbody = document.getElementById('licensureBody');
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="text" name="licensureTitle[]"></td>
        <td><input type="number" name="licensureYear[]" min="1900" max="2100"></td>
        <td><input type="text" name="licensureVenue[]"></td>
        <td><input type="text" name="licensureRating[]"></td>
        <td><input type="text" name="licensureRemarks[]"></td>
        <td><input type="date" name="licensureExpiry[]"></td>
        <td><button type="button" class="btn-remove" onclick="removeLicensureRow(this)">Remove</button></td>
    `;
    tbody.appendChild(row);
    
    row.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', debounce(saveFormData, 1000));
    });
}

function removeLicensureRow(button) {
    const tbody = document.getElementById('licensureBody');
    if (tbody.children.length > 1) {
        button.closest('tr').remove();
        saveFormData();
    } else {
        showNotification('You must have at least one row. Clear the fields instead.', 'warning');
    }
}

function addCompetencyRow() {
    const tbody = document.getElementById('competencyBody');
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="text" name="competencyTitle[]"></td>
        <td><input type="text" name="competencyLevel[]"></td>
        <td><input type="text" name="competencySector[]"></td>
        <td><input type="text" name="competencyCert[]"></td>
        <td><input type="date" name="competencyIssuance[]"></td>
        <td><input type="date" name="competencyExpiry[]"></td>
        <td><button type="button" class="btn-remove" onclick="removeCompetencyRow(this)">Remove</button></td>
    `;
    tbody.appendChild(row);
    
    row.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', debounce(saveFormData, 1000));
    });
}

function removeCompetencyRow(button) {
    const tbody = document.getElementById('competencyBody');
    if (tbody.children.length > 1) {
        button.closest('tr').remove();
        saveFormData();
    } else {
        showNotification('You must have at least one row. Clear the fields instead.', 'warning');
    }
}

// Setup Validation
function setupValidation() {
    // Email validation
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            validateEmail(this);
        });
    }

    // Mobile validation
    const mobileInput = document.getElementById('mobile');
    if (mobileInput) {
        mobileInput.addEventListener('blur', function() {
            validateMobile(this);
        });
    }

    // Date validation
    const birthDateInput = document.getElementById('birthDate');
    if (birthDateInput) {
        birthDateInput.addEventListener('change', function() {
            validateDateOfBirth(this);
        });
    }
}

// Validate email
function validateEmail(input) {
    const email = input.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
        showFieldError(input, 'Email is required');
        return false;
    } else if (!emailRegex.test(email)) {
        showFieldError(input, 'Please enter a valid email address (e.g., name@example.com)');
        return false;
    } else {
        clearFieldError(input);
        return true;
    }
}

// Validate mobile
function validateMobile(input) {
    const mobile = input.value.replace(/\D/g, '');
    
    if (!mobile) {
        showFieldError(input, 'Mobile number is required');
        return false;
    } else if (mobile.length < 10 || mobile.length > 13) {
        showFieldError(input, 'Mobile number should be 10-13 digits (e.g., 09123456789)');
        return false;
    } else {
        clearFieldError(input);
        return true;
    }
}

// Validate date of birth
function validateDateOfBirth(input) {
    const dob = new Date(input.value);
    const today = new Date();
    
    if (!input.value) {
        showFieldError(input, 'Date of birth is required');
        return false;
    } else if (dob > today) {
        showFieldError(input, 'Date of birth cannot be in the future');
        return false;
    } else {
        clearFieldError(input);
        return true;
    }
}

function showFieldError(field, message) {
    field.classList.add('error');
    let errorDiv = field.parentElement.querySelector('.error-message');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        field.parentElement.appendChild(errorDiv);
    }
    errorDiv.textContent = message;
}

function clearFieldError(field) {
    field.classList.remove('error');
    const errorDiv = field.parentElement.querySelector('.error-message');
    if (errorDiv) errorDiv.remove();
}

// Populate Admission Slip
function populateAdmissionSlip() {
    const surname = document.getElementById('surname')?.value || '';
    const firstname = document.getElementById('firstname')?.value || '';
    const middleName = document.getElementById('middleName')?.value || '';
    const nameExtension = document.getElementById('nameExtension')?.value || '';
    
    const fullName = `${surname}, ${firstname} ${middleName} ${nameExtension}`.trim().replace(/\s+/g, ' ');
    
    const qualifiable = document.getElementById('referenceQualifiable')?.value || '';
    const yy = document.getElementById('referenceYY')?.value || '';
    const region = document.getElementById('referenceRegion')?.value || '';
    const province = document.getElementById('referenceProvince')?.value || '';
    const number = document.getElementById('referenceNumber')?.value || '';
    const series = document.getElementById('referenceSeries')?.value || '';
    const fullReference = `${qualifiable}${yy}${region}${province}${number}${series}`;
    
    const mobile = document.getElementById('mobile')?.value || '';
    const tel = document.getElementById('tel')?.value || '';
    const assessmentTitle = document.getElementById('assessmentTitle')?.value || '';
    
    if (document.getElementById('admissionReference')) {
        document.getElementById('admissionReference').value = fullReference;
    }
    if (document.getElementById('admissionName')) {
        document.getElementById('admissionName').textContent = fullName || 'Not provided';
    }
    if (document.getElementById('admissionTel')) {
        document.getElementById('admissionTel').textContent = mobile || tel || 'Not provided';
    }
    if (document.getElementById('admissionAssessment')) {
        document.getElementById('admissionAssessment').textContent = assessmentTitle || 'Not provided';
    }
    if (document.getElementById('applicantNamePrint')) {
        document.getElementById('applicantNamePrint').value = fullName;
    }
    if (document.getElementById('applicantDatePrint') && document.getElementById('applicationDate')) {
        document.getElementById('applicantDatePrint').value = document.getElementById('applicationDate').value || '';
    }
}

// -------------------- PRINT LAYOUT GENERATION --------------------
function initializePrintTemplate() {
    // Pre-create empty box grids so print layout is stable even before data
    renderColoredBoxes('', 13, 'plRefBoxes');
    renderColoredBoxes('', 17, 'plUliBoxes');
    renderColoredBoxes('', 13, 'plAdmissionRefBoxes');

    renderCharBoxes('', 28, 'plSurnameBoxes');
    renderCharBoxes('', 28, 'plFirstnameBoxes');
    renderCharBoxes('', 28, 'plMiddlenameBoxes');
    renderCharBoxes('', 2, 'plMiddleInitialBoxes');
    renderCharBoxes('', 4, 'plNameExtBoxes');

    buildPrintLayout();
}

function renderColoredBoxes(value, count, targetId) {
    const el = document.getElementById(targetId);
    if (!el) return;
    el.innerHTML = '';
    const v = (value || '').toString().toUpperCase();
    
    // Official TESDA color sequence matching the form images
    const colors = [
        '#c7d8f2', // Light blue
        '#c8b28f', // Light brown/tan  
        '#e5c1c8', // Light pink
        '#c7dfc5', // Light green
        '#f2c59d', // Light orange
        '#c6b7d8', // Light purple/lavender
        '#c7d8f2', // Light blue (repeat)
        '#c8b28f', // Light brown/tan (repeat)
        '#e5c1c8', // Light pink (repeat)
        '#c7dfc5', // Light green (repeat)
        '#f2c59d', // Light orange (repeat)
        '#c6b7d8', // Light purple/lavender (repeat)
        '#c7d8f2'  // Light blue (repeat)
    ];
    
    for (let i = 0; i < count; i++) {
        const ch = v[i] || '';
        const cell = document.createElement('div');
        cell.className = 'pl-boxcell';
        cell.style.cssText = `
            width: 18px;
            height: 18px;
            border: 1px solid #000;
            display: grid;
            place-items: center;
            font-size: 11px;
            font-weight: 700;
            background: ${ch ? colors[i % colors.length] : '#fff'};
        `;
        cell.textContent = ch;
        el.appendChild(cell);
    }
}

function renderCharBoxes(value, count, targetId) {
    const el = document.getElementById(targetId);
    if (!el) return;
    el.innerHTML = '';
    const v = (value || '').toString().toUpperCase();
    for (let i = 0; i < count; i++) {
        const ch = v[i] || '';
        const cell = document.createElement('div');
        cell.className = `pl-boxcell ${ch ? 'empty' : 'empty'}`;
        cell.textContent = ch;
        el.appendChild(cell);
    }
}

function setCheckedBox(id, checked) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('checked', !!checked);
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text || '';
}

function setHTML(id, html) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = html || '';
}

function fmtDate(iso) {
    if (!iso) return '';
    try {
        const d = new Date(iso);
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const yyyy = d.getFullYear();
        return `${mm}/${dd}/${yyyy}`;
    } catch {
        return iso;
    }
}

function buildPrintTableFromInputs(tbodyId, rowSelector, columns) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    tbody.innerHTML = '';
    const rows = Array.from(document.querySelectorAll(rowSelector));
    const dataRows = rows
        .map(r => columns.map(sel => (r.querySelector(sel)?.value || '').trim()))
        .filter(cols => cols.some(v => v));

    // Always show 3 empty rows like the reference if nothing entered
    const out = dataRows.length ? dataRows : [[], [], []];

    out.forEach(cols => {
        const tr = document.createElement('tr');
        columns.forEach((_, idx) => {
            const td = document.createElement('td');
            td.textContent = cols[idx] || '';
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

function buildPrintLayout() {
    // Reference / ULI boxes
    const qual = document.getElementById('referenceQualifiable')?.value || '';
    const yy = document.getElementById('referenceYY')?.value || '';
    const reg = document.getElementById('referenceRegion')?.value || '';
    const prov = document.getElementById('referenceProvince')?.value || '';
    const num = document.getElementById('referenceNumber')?.value || '';
    const series = document.getElementById('referenceSeries')?.value || '';
    const ref = `${qual}${yy}${reg}${prov}${num}${series}`.toUpperCase();
    renderColoredBoxes(ref, 13, 'plRefBoxes');
    renderColoredBoxes(ref, 13, 'plAdmissionRefBoxes');

    // ULI remains empty unless processing officer fills it; print boxes blank
    const uliValue = document.getElementById('uli')?.value || '';
    renderColoredBoxes(uliValue.replace(/[^A-Za-z0-9]/g, ''), 17, 'plUliBoxes');

    // Images
    const plPic = document.getElementById('plPicture');
    if (plPic) plPic.src = pictureImage || '';
    const plSig = document.getElementById('plSignature');
    if (plSig) plSig.src = signatureImage || '';
    const plAPic = document.getElementById('plAdmissionPicture');
    if (plAPic) plAPic.src = admissionPictureImage || '';

    // Top fields
    setText('plApplicationDate', fmtDate(document.getElementById('applicationDate')?.value || ''));
    setText('plSchoolName', document.getElementById('schoolName')?.value || '');
    setText('plSchoolAddress', document.getElementById('schoolAddress')?.value || '');
    setText('plAssessmentTitle', document.getElementById('assessmentTitle')?.value || '');

    // Assessment type checkboxes
    const at = document.querySelector('input[name="assessmentType"]:checked')?.value || '';
    setCheckedBox('plAssessFull', at === 'full');
    setCheckedBox('plAssessCoc', at === 'coc');
    setCheckedBox('plAssessRenewal', at === 'renewal');

    // Client type
    const ct = document.querySelector('input[name="clientType"]:checked')?.value || '';
    setCheckedBox('plClientTVETGradStud', ct === 'tvet-graduating');
    setCheckedBox('plClientTVETGrad', ct === 'tvet-graduate');
    setCheckedBox('plClientIndustry', ct === 'industry-worker');
    setCheckedBox('plClientK12', ct === 'k12');
    setCheckedBox('plClientOWF', ct === 'owf');

    // Name boxes
    const surname = document.getElementById('surname')?.value || '';
    const firstname = document.getElementById('firstname')?.value || '';
    const middlename = document.getElementById('middleName')?.value || '';
    const middleInitial = document.getElementById('middleInitial')?.value || '';
    const nameExt = document.getElementById('nameExtension')?.value || '';
    renderCharBoxes(surname, 28, 'plSurnameBoxes');
    renderCharBoxes(firstname, 28, 'plFirstnameBoxes');
    renderCharBoxes(middlename, 28, 'plMiddlenameBoxes');
    renderCharBoxes(middleInitial, 2, 'plMiddleInitialBoxes');
    renderCharBoxes(nameExt, 4, 'plNameExtBoxes');

    // Address blocks
    setText('plAddrStreet', document.getElementById('mailingNumber')?.value || '');
    setText('plAddrBarangay', document.getElementById('barangay')?.value || '');
    setText('plAddrDistrict', document.getElementById('district')?.value || '');
    setText('plAddrCity', document.getElementById('city')?.value || '');
    setText('plAddrProvince', document.getElementById('province')?.value || '');
    setText('plAddrRegion', document.getElementById('region')?.value || '');
    setText('plAddrZip', document.getElementById('zip')?.value || '');

    // Parents + sex + civil
    setText('plMothersName', document.getElementById('mothersName')?.value || '');
    setText('plFathersName', document.getElementById('fathersName')?.value || '');
    const sex = document.querySelector('input[name="sex"]:checked')?.value || '';
    setCheckedBox('plSexMale', sex === 'male');
    setCheckedBox('plSexFemale', sex === 'female');
    const civil = document.querySelector('input[name="civilStatus"]:checked')?.value || '';
    setCheckedBox('plCivilSingle', civil === 'single');
    setCheckedBox('plCivilMarried', civil === 'married');
    setCheckedBox('plCivilWidower', civil === 'widower');
    setCheckedBox('plCivilSeparated', civil === 'separated');

    // Contact
    setText('plTel', document.getElementById('tel')?.value || '');
    setText('plMobile', document.getElementById('mobile')?.value || '');
    setText('plEmail', document.getElementById('email')?.value || '');
    setText('plFax', document.getElementById('fax')?.value || '');
    setText('plOthers', document.getElementById('otherContact')?.value || '');

    // Education + Employment
    const edu = document.querySelector('input[name="education"]:checked')?.value || '';
    setCheckedBox('plEduElem', edu === 'elementary');
    setCheckedBox('plEduHS', edu === 'highschool');
    setCheckedBox('plEduTVET', edu === 'tvet');
    setCheckedBox('plEduCollegeLvl', edu === 'college-level');
    setCheckedBox('plEduCollegeGrad', edu === 'college-graduate');
    setCheckedBox('plEduOther', edu === 'others');
    const emp = document.querySelector('input[name="employmentStatus"]:checked')?.value || '';
    setCheckedBox('plEmpCasual', emp === 'casual');
    setCheckedBox('plEmpJobOrder', emp === 'job-order');
    setCheckedBox('plEmpProb', emp === 'probationary');
    setCheckedBox('plEmpPerm', emp === 'permanent');
    setCheckedBox('plEmpSelf', emp === 'self-employed');
    setCheckedBox('plEmpOFW', emp === 'ofw');

    // Birth fields
    setText('plBirthDate', fmtDate(document.getElementById('birthDate')?.value || ''));
    setText('plBirthPlace', document.getElementById('birthPlace')?.value || '');
    setText('plAge', document.getElementById('age')?.value || '');

    // Tables (copy from input tables)
    buildPrintTableFromInputs(
        'plWorkBody',
        '#workExperienceBody tr',
        ['[name="workCompany[]"]', '[name="workPosition[]"]', '[name="workDates[]"]', '[name="workSalary[]"]', '[name="workStatus[]"]', '[name="workYears[]"]']
    );
    buildPrintTableFromInputs(
        'plTrainingBody',
        '#trainingBody tr',
        ['[name="trainingTitle[]"]', '[name="trainingVenue[]"]', '[name="trainingDates[]"]', '[name="trainingHours[]"]', '[name="trainingConductedBy[]"]']
    );
    buildPrintTableFromInputs(
        'plLicensureBody',
        '#licensureBody tr',
        ['[name="licensureTitle[]"]', '[name="licensureYear[]"]', '[name="licensureVenue[]"]', '[name="licensureRating[]"]', '[name="licensureRemarks[]"]', '[name="licensureExpiry[]"]']
    );
    buildPrintTableFromInputs(
        'plCompetencyBody',
        '#competencyBody tr',
        ['[name="competencyTitle[]"]', '[name="competencyLevel[]"]', '[name="competencySector[]"]', '[name="competencyCert[]"]', '[name="competencyIssuance[]"]', '[name="competencyExpiry[]"]']
    );

    // Admission slip values (from existing admission fields)
    setText('plAdmissionName', (document.getElementById('applicantNamePrint')?.value || '').trim());
    setText('plAdmissionTel', (document.getElementById('mobile')?.value || document.getElementById('tel')?.value || '').trim());
    setText('plAdmissionAssessment', (document.getElementById('assessmentTitle')?.value || '').trim());
    setText('plAdmissionOR', document.getElementById('officialReceipt')?.value || '');
    setText('plAdmissionIssued', fmtDate(document.getElementById('dateIssued')?.value || ''));
    setText('plAdmissionCenter', document.getElementById('assessmentCenter')?.value || '');
    setText('plAdmissionRemarks', document.getElementById('remarks')?.value || '');
    setText('plAdmissionDate', fmtDate(document.getElementById('assessmentDate')?.value || ''));
    setText('plAdmissionTime', document.getElementById('assessmentTime')?.value || '');
    setText('plOfficerDate', fmtDate(document.getElementById('officerDate')?.value || ''));
    setText('plApplicantDate2', fmtDate(document.getElementById('applicationDate')?.value || ''));

    // Requirements checkboxes
    const reqs = Array.from(document.querySelectorAll('input[name="requirements[]"]:checked')).map(x => x.value);
    setCheckedBox('plReqSAG', reqs.includes('self-assessment'));
    setCheckedBox('plReqPics', reqs.includes('pictures'));
    setCheckedBox('plReqPPE', reqs.includes('ppe'));
    const hasOther = reqs.includes('others');
    setCheckedBox('plReqOther', hasOther);
    setText('plReqOtherText', hasOther ? (document.getElementById('otherRequirements')?.value || '') : '');
}

// Save form data (download JSON)
function saveForm() {
    // Save the TESDA layout as a standalone HTML that can be printed
    buildPrintLayout();

    const printHtml = document.getElementById('printLayout')?.outerHTML || '';
    const fullDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TESDA Application Form (Saved)</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  ${printHtml}
  <script>
    // Force showing print layout if opened directly
    document.querySelector('.print-layout').style.display = 'block';
  <\/script>
</body>
</html>`;

    const blob = new Blob([fullDoc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const surname = (document.getElementById('surname')?.value || 'applicant').replace(/\s+/g, '_');
    link.download = `TESDA_CAATE_Application_${surname}_${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotification('Saved TESDA print layout (HTML). Open it and press Print.', 'success');
}

// Get form data
function getFormData() {
    const surname = document.getElementById('surname')?.value || '';
    const firstname = document.getElementById('firstname')?.value || '';
    const middleName = document.getElementById('middleName')?.value || '';
    const nameExtension = document.getElementById('nameExtension')?.value || '';
    
    const qualifiable = document.getElementById('referenceQualifiable')?.value || '';
    const yy = document.getElementById('referenceYY')?.value || '';
    const region = document.getElementById('referenceRegion')?.value || '';
    const province = document.getElementById('referenceProvince')?.value || '';
    const number = document.getElementById('referenceNumber')?.value || '';
    const series = document.getElementById('referenceSeries')?.value || '';
    
    return {
        referenceNumber: `${qualifiable}${yy}${region}${province}${number}${series}`,
        fullName: `${surname}, ${firstname} ${middleName} ${nameExtension}`.trim(),
        surname,
        firstname,
        middleName,
        nameExtension,
        schoolName: document.getElementById('schoolName')?.value || '',
        assessmentTitle: document.getElementById('assessmentTitle')?.value || '',
        assessmentType: document.querySelector('input[name="assessmentType"]:checked')?.value || '',
        clientType: document.querySelector('input[name="clientType"]:checked')?.value || '',
        sex: document.querySelector('input[name="sex"]:checked')?.value || '',
        civilStatus: document.querySelector('input[name="civilStatus"]:checked')?.value || '',
        birthDate: document.getElementById('birthDate')?.value || '',
        age: document.getElementById('age')?.value || '',
        mobile: document.getElementById('mobile')?.value || '',
        email: document.getElementById('email')?.value || '',
        tel: document.getElementById('tel')?.value || '',
        education: document.querySelector('input[name="education"]:checked')?.value || '',
        employmentStatus: document.querySelector('input[name="employmentStatus"]:checked')?.value || ''
    };
}

// Print form
function printForm() {
    // Validate required fields before printing
    const missingFields = validateAllRequiredFields();
    
    if (missingFields.length > 0) {
        showValidationPopup(missingFields);
        return;
    }
    
    populateAdmissionSlip();
    buildPrintLayout();
    window.print();
}

// Setup form submission
function setupFormSubmission() {
    const form = document.getElementById('applicationForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate all required fields and collect missing ones
        const missingFields = validateAllRequiredFields();
        
        if (missingFields.length > 0) {
            showValidationPopup(missingFields);
            return;
        }
        
        // Build the exact TESDA layout for record/printing
        buildPrintLayout();

        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.textContent = 'Submitting...';
        submitButton.disabled = true;
        
        // Simulate submission
        setTimeout(() => {
            showNotification('Application submitted successfully! Thank you for your interest.', 'success');
            
            // Clear saved data after successful submission
            localStorage.removeItem(AUTO_SAVE_KEY);
            
            // Optionally reset form or show success page
            submitButton.textContent = 'Submit Application';
            submitButton.disabled = false;
        }, 2000);
    });
}

// Validate all required fields and return list of missing ones
function validateAllRequiredFields() {
    const missingFields = [];
    const form = document.getElementById('applicationForm');
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        const fieldName = getFieldDisplayName(field);
        
        if (field.type === 'radio') {
            const checked = form.querySelector(`input[name="${field.name}"]:checked`);
            if (!checked) {
                // Only add once per radio group
                if (!missingFields.some(f => f.name === field.name)) {
                    missingFields.push({
                        element: field,
                        name: field.name,
                        label: fieldName,
                        type: 'radio'
                    });
                }
            }
        } else if (field.type === 'file') {
            if (!field.files[0] && field.id === 'picture') {
                missingFields.push({
                    element: field,
                    name: field.name,
                    label: fieldName,
                    type: 'file'
                });
            }
        } else if (!field.value.trim() && !field.readOnly) {
            missingFields.push({
                element: field,
                name: field.name,
                label: fieldName,
                type: 'input'
            });
        }
        
        // Specific validations for filled fields
        if (field.id === 'email' && field.value && !validateEmail(field)) {
            missingFields.push({
                element: field,
                name: field.name,
                label: fieldName + ' (invalid format)',
                type: 'validation'
            });
        }
        if (field.id === 'mobile' && field.value && !validateMobile(field)) {
            missingFields.push({
                element: field,
                name: field.name,
                label: fieldName + ' (invalid format)',
                type: 'validation'
            });
        }
        if (field.id === 'birthDate' && field.value && !validateDateOfBirth(field)) {
            missingFields.push({
                element: field,
                name: field.name,
                label: fieldName + ' (invalid date)',
                type: 'validation'
            });
        }
    });
    
    // Check signature
    if (!signatureImage) {
        missingFields.push({
            element: document.getElementById('signatureCanvas'),
            name: 'signature',
            label: 'Applicant\'s Signature',
            type: 'signature'
        });
    }
    
    return missingFields;
}

// Get user-friendly field name
function getFieldDisplayName(field) {
    const label = field.closest('.form-group')?.querySelector('label')?.textContent?.replace('*', '').trim();
    if (label) return label;
    
    // Fallback names
    const fieldNames = {
        'surname': 'Surname',
        'firstname': 'First Name',
        'schoolName': 'School/Training Center/Company Name',
        'schoolAddress': 'School Address',
        'assessmentTitle': 'Assessment Title',
        'assessmentType': 'Assessment Type',
        'clientType': 'Client Type',
        'applicationDate': 'Application Date',
        'sex': 'Sex',
        'civilStatus': 'Civil Status',
        'mobile': 'Mobile Number',
        'email': 'Email Address',
        'education': 'Highest Educational Attainment',
        'employmentStatus': 'Employment Status',
        'birthDate': 'Birth Date',
        'picture': 'Picture (Passport Size)'
    };
    
    return fieldNames[field.name] || fieldNames[field.id] || field.name || field.id || 'Unknown Field';
}

// Show validation popup with missing fields
function showValidationPopup(missingFields) {
    // Remove existing popup if any
    const existingPopup = document.getElementById('validationPopup');
    if (existingPopup) {
        existingPopup.remove();
    }
    
    // Create popup overlay
    const overlay = document.createElement('div');
    overlay.id = 'validationPopup';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;
    
    // Create popup content
    const popup = document.createElement('div');
    popup.style.cssText = `
        background: white;
        border-radius: 12px;
        padding: 30px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: slideInUp 0.3s ease;
        border: 3px solid #dc3545;
    `;
    
    // Create popup header
    const header = document.createElement('div');
    header.style.cssText = `
        display: flex;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 2px solid #dc3545;
    `;
    
    const icon = document.createElement('div');
    icon.className = 'warning-icon-indicator';
    icon.style.cssText = `
        width: 2rem;
        height: 2rem;
        background: #dc3545;
        border-radius: 50%;
        margin-right: 15px;
        position: relative;
        flex-shrink: 0;
    `;
    
    // Add warning symbol using CSS
    icon.innerHTML = '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-weight: bold; font-size: 1.2rem;">!</div>';
    
    const title = document.createElement('h2');
    title.textContent = 'Required Fields Missing';
    title.style.cssText = `
        color: #dc3545;
        margin: 0;
        font-size: 1.5rem;
        font-weight: 700;
    `;
    
    header.appendChild(icon);
    header.appendChild(title);
    
    // Create message
    const message = document.createElement('p');
    message.textContent = 'Please complete the following required fields before submitting:';
    message.style.cssText = `
        margin: 0 0 20px 0;
        color: #495057;
        font-size: 1rem;
        line-height: 1.5;
    `;
    
    // Create fields list
    const fieldsList = document.createElement('ul');
    fieldsList.style.cssText = `
        margin: 0 0 25px 0;
        padding: 0;
        list-style: none;
        max-height: 300px;
        overflow-y: auto;
    `;
    
    missingFields.forEach((field, index) => {
        const listItem = document.createElement('li');
        listItem.style.cssText = `
            padding: 12px 15px;
            margin: 8px 0;
            background: #f8f9fa;
            border-left: 4px solid #dc3545;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            font-weight: 500;
        `;
        
        const bullet = document.createElement('span');
        bullet.textContent = `${index + 1}. `;
        bullet.style.cssText = `
            color: #dc3545;
            font-weight: 700;
            margin-right: 8px;
        `;
        
        const fieldLabel = document.createElement('span');
        fieldLabel.textContent = field.label;
        
        listItem.appendChild(bullet);
        listItem.appendChild(fieldLabel);
        
        // Add click handler to scroll to field
        listItem.addEventListener('click', () => {
            overlay.remove();
            if (field.element) {
                field.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => {
                    if (field.type === 'signature') {
                        // Focus on signature canvas area
                        document.getElementById('signatureCanvas')?.focus();
                    } else {
                        field.element.focus();
                    }
                }, 500);
            }
        });
        
        listItem.addEventListener('mouseenter', () => {
            listItem.style.background = '#e9ecef';
            listItem.style.transform = 'translateX(5px)';
        });
        
        listItem.addEventListener('mouseleave', () => {
            listItem.style.background = '#f8f9fa';
            listItem.style.transform = 'translateX(0)';
        });
        
        fieldsList.appendChild(listItem);
    });
    
    // Create buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        gap: 15px;
        justify-content: center;
        margin-top: 20px;
    `;
    
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.cssText = `
        padding: 12px 30px;
        background: #6c757d;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
    `;
    
    closeButton.addEventListener('click', () => {
        overlay.remove();
    });
    
    closeButton.addEventListener('mouseenter', () => {
        closeButton.style.background = '#5a6268';
        closeButton.style.transform = 'translateY(-1px)';
    });
    
    closeButton.addEventListener('mouseleave', () => {
        closeButton.style.background = '#6c757d';
        closeButton.style.transform = 'translateY(0)';
    });
    
    const fillFirstButton = document.createElement('button');
    fillFirstButton.textContent = 'Go to First Missing Field';
    fillFirstButton.style.cssText = `
        padding: 12px 30px;
        background: #1a5490;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
    `;
    
    fillFirstButton.addEventListener('click', () => {
        overlay.remove();
        if (missingFields[0]?.element) {
            missingFields[0].element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => {
                if (missingFields[0].type === 'signature') {
                    document.getElementById('signatureCanvas')?.focus();
                } else {
                    missingFields[0].element.focus();
                }
            }, 500);
        }
    });
    
    fillFirstButton.addEventListener('mouseenter', () => {
        fillFirstButton.style.background = '#0d3a66';
        fillFirstButton.style.transform = 'translateY(-1px)';
    });
    
    fillFirstButton.addEventListener('mouseleave', () => {
        fillFirstButton.style.background = '#1a5490';
        fillFirstButton.style.transform = 'translateY(0)';
    });
    
    buttonContainer.appendChild(fillFirstButton);
    buttonContainer.appendChild(closeButton);
    
    // Assemble popup
    popup.appendChild(header);
    popup.appendChild(message);
    popup.appendChild(fieldsList);
    popup.appendChild(buttonContainer);
    overlay.appendChild(popup);
    
    // Add to document
    document.body.appendChild(overlay);
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
    
    // Close on Escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            overlay.remove();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
    
    @keyframes slideInUp {
        from {
            transform: translateY(50px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);
// Friendly UI Functions for Application Form

// Step Progress Management
function updateStepProgress(currentStep, totalSteps = 4) {
    const progressFill = document.getElementById('stepProgressFill');
    const currentStepSpan = document.getElementById('currentStep');
    
    if (progressFill && currentStepSpan) {
        const progressPercentage = (currentStep / totalSteps) * 100;
        progressFill.style.width = progressPercentage + '%';
        currentStepSpan.textContent = currentStep;
        
        // Update progress text based on step
        const progressText = document.querySelector('.step-progress-text');
        if (progressText) {
            const messages = [
                "Step 1 of 4 - Let's get started!",
                "Step 2 of 4 - Tell us about yourself!",
                "Step 3 of 4 - Almost there!",
                "Step 4 of 4 - Final step!"
            ];
            progressText.textContent = messages[currentStep - 1] || `Step ${currentStep} of ${totalSteps}`;
        }
    }
}

// Form Validation with Friendly Messages
function validateFormSection(sectionElement) {
    const inputs = sectionElement.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    let firstInvalidField = null;

    inputs.forEach(input => {
        const isFieldValid = validateField(input);
        if (!isFieldValid && !firstInvalidField) {
            firstInvalidField = input;
        }
        isValid = isValid && isFieldValid;
    });

    // Show friendly validation message
    if (!isValid && firstInvalidField) {
        showFriendlyNotification('Please fill in all required fields before continuing.', 'warning');
        firstInvalidField.focus();
        firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    const fieldGroup = field.closest('.form-group') || field.closest('.input-group-friendly');
    
    if (!fieldGroup) return true;

    // Remove existing error states
    fieldGroup.classList.remove('error');
    const errorElement = fieldGroup.querySelector('.form-error');
    if (errorElement) {
        errorElement.style.display = 'none';
    }

    // Check if required field is empty
    if (field.hasAttribute('required') && !value) {
        showFieldError(fieldGroup, 'This field is required');
        return false;
    }

    // Specific validations
    if (value) {
        switch (field.type) {
            case 'email':
                if (!isValidEmail(value)) {
                    showFieldError(fieldGroup, 'Please enter a valid email address');
                    return false;
                }
                break;
            case 'tel':
                if (!isValidPhone(value)) {
                    showFieldError(fieldGroup, 'Please enter a valid phone number');
                    return false;
                }
                break;
        }
    }

    return true;
}

function showFieldError(fieldGroup, message) {
    fieldGroup.classList.add('error');
    let errorElement = fieldGroup.querySelector('.form-error');
    
    if (!errorElement) {
        errorElement = document.createElement('span');
        errorElement.className = 'form-error';
        fieldGroup.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^(\+63|0)?[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Friendly Notifications
function showFriendlyNotification(message, type = 'info', duration = 4000) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.friendly-notification');
    existingNotifications.forEach(notif => notif.remove());

    const notification = document.createElement('div');
    notification.className = `friendly-notification friendly-notification-${type}`;
    
    const colors = {
        success: '#4caf50',
        error: '#f44336',
        warning: '#ff9800',
        info: '#2196f3'
    };

    const icons = {
        success: '<div style="color: white; font-weight: bold;">✓</div>',
        error: '<div style="color: white; font-weight: bold;">✗</div>',
        warning: '<div style="color: white; font-weight: bold;">!</div>',
        info: '<div style="color: white; font-weight: bold;">i</div>'
    };

    notification.innerHTML = `
        <div class="notification-icon" style="background: ${colors[type]}">${icons[type]}</div>
        <div class="notification-content">
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 12px;
        max-width: 400px;
        border-left: 4px solid ${colors[type]};
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);

    // Auto remove
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, duration);
}

// Form Auto-Save Functionality
let autoSaveTimer;
function enableAutoSave() {
    const form = document.getElementById('applicationForm');
    if (!form) return;

    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            clearTimeout(autoSaveTimer);
            autoSaveTimer = setTimeout(() => {
                saveFormData();
            }, 2000); // Save after 2 seconds of inactivity
        });
    });
}

function saveFormData() {
    const form = document.getElementById('applicationForm');
    if (!form) return;

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    try {
        localStorage.setItem('betci_application_draft', JSON.stringify(data));
        showAutoSaveIndicator();
    } catch (error) {
        console.warn('Could not save form data:', error);
    }
}

function loadFormData() {
    try {
        const savedData = localStorage.getItem('betci_application_draft');
        if (savedData) {
            const data = JSON.parse(savedData);
            const form = document.getElementById('applicationForm');
            
            Object.keys(data).forEach(key => {
                const field = form.querySelector(`[name="${key}"]`);
                if (field) {
                    field.value = data[key];
                }
            });
            
            showFriendlyNotification('Previous form data restored!', 'info');
        }
    } catch (error) {
        console.warn('Could not load form data:', error);
    }
}

function showAutoSaveIndicator() {
    let indicator = document.getElementById('autoSaveIndicator');
    
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'autoSaveIndicator';
        indicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #4caf50;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        indicator.textContent = 'Draft saved';
        document.body.appendChild(indicator);
    }
    
    indicator.style.opacity = '1';
    setTimeout(() => {
        indicator.style.opacity = '0';
    }, 2000);
}

// Form Navigation Functions
function saveForm() {
    saveFormData();
    showFriendlyNotification('Your progress has been saved!', 'success');
}

// Enhanced Form Submission
function submitApplicationForm() {
    const form = document.getElementById('applicationForm');
    if (!form) return;

    // Validate entire form
    const sections = form.querySelectorAll('.form-section');
    let isFormValid = true;

    sections.forEach(section => {
        const sectionValid = validateFormSection(section);
        isFormValid = isFormValid && sectionValid;
    });

    if (!isFormValid) {
        showFriendlyNotification('Please complete all required fields before submitting.', 'error');
        return;
    }

    // Show loading state
    const submitBtn = form.querySelector('.btn-submit, .nav-btn-friendly[type="submit"]');
    if (submitBtn) {
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<div class="loading-spinner-friendly"></div> Submitting...';
        submitBtn.disabled = true;

        // Simulate submission
        setTimeout(() => {
            // Clear saved draft
            localStorage.removeItem('betci_application_draft');
            
            // Show success
            showSuccessMessage();
            
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 3000);
    }
}

function showSuccessMessage() {
    const successHtml = `
        <div class="success-celebration">
            <div class="celebration-title">Application Submitted Successfully!</div>
            <div class="celebration-text">Thank you for applying to BETCI. We'll review your application and contact you soon.</div>
            <div style="margin-top: 20px;">
                <button class="btn-friendly" onclick="window.location.href='dashboard-fixed.html'">
                    Return to Dashboard
                </button>
            </div>
        </div>
    `;
    
    const container = document.querySelector('.form-container');
    if (container) {
        container.innerHTML = successHtml;
    }
}

// Admission Slip Functions
function generateAdmissionSlip() {
    const form = document.getElementById('admissionForm');
    if (!form) return;

    // Validate required fields
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.focus();
        }
    });

    if (!isValid) {
        showFriendlyNotification('Please fill in all required fields.', 'warning');
        return;
    }

    // Show loading
    const generateBtn = document.querySelector('[onclick="generateAdmissionSlip()"]');
    if (generateBtn) {
        const originalText = generateBtn.innerHTML;
        generateBtn.innerHTML = '<div class="loading-spinner-friendly"></div> Generating...';
        generateBtn.disabled = true;

        setTimeout(() => {
            showFriendlyNotification('Admission slip generated successfully!', 'success');
            generateBtn.innerHTML = originalText;
            generateBtn.disabled = false;
        }, 2000);
    }
}

function printAdmissionSlip() {
    showFriendlyNotification('Preparing document for printing...', 'info');
    setTimeout(() => {
        window.print();
    }, 1000);
}

// Initialize friendly UI when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Enable auto-save
    enableAutoSave();
    
    // Load saved data
    loadFormData();
    
    // Add form submission handler
    const form = document.getElementById('applicationForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            submitApplicationForm();
        });
    }
    
    // Add input validation listeners
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => {
            // Clear error state on input
            const fieldGroup = input.closest('.form-group') || input.closest('.input-group-friendly');
            if (fieldGroup) {
                fieldGroup.classList.remove('error');
                const errorElement = fieldGroup.querySelector('.form-error');
                if (errorElement) {
                    errorElement.style.display = 'none';
                }
            }
        });
    });
    
    // Initialize step progress
    updateStepProgress(1);
    
    console.log('Friendly UI initialized successfully!');
});

// Export functions for global access
window.updateStepProgress = updateStepProgress;
window.saveForm = saveForm;
window.submitApplicationForm = submitApplicationForm;
window.generateAdmissionSlip = generateAdmissionSlip;
window.printAdmissionSlip = printAdmissionSlip;
window.showFriendlyNotification = showFriendlyNotification;