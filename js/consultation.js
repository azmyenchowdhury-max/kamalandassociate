/* ===================================
   Consultation Page JavaScript
   Payment & Consultation System
   Backend Database Integration
   =================================== */

document.addEventListener('DOMContentLoaded', function() {
    // Supabase Configuration
    const SUPABASE_URL = 'https://xtpvadsmapafzkhhnlio.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjFkYjI5NmJmLTczMzktNGU0Ny1iMjdmLThlNWYwOGZhOWQ4ZSJ9.eyJwcm9qZWN0SWQiOiJ4dHB2YWRzbWFwYWZ6a2hobmxpbyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzcwMDA3MzkzLCJleHAiOjIwODUzNjczOTMsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.JQJq2LRDRaDvviKvPOyN0X3rKLCTTo06oSqjRauMJpg';
    
    // API Helper Function
    async function invokeEdgeFunction(functionName, body) {
        try {
            const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'apikey': SUPABASE_ANON_KEY
                },
                body: JSON.stringify(body)
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `API Error: ${response.status}`);
            }
            
            return response.json();
        } catch (error) {
            console.error(`Error calling ${functionName}:`, error);
            throw error;
        }
    }
    
    // API Helper Function for multipart file uploads
    async function invokeEdgeFunctionWithFiles(functionName, body, files) {
        try {
            const formData = new FormData();
            
            // Add JSON body as a field
            formData.append('data', JSON.stringify(body));
            
            // Add files
            files.forEach((file, index) => {
                formData.append(`file_${index}`, file.file);
            });
            
            const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'apikey': SUPABASE_ANON_KEY
                    // Don't set Content-Type, let the browser set it with boundary
                },
                body: formData
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `API Error: ${response.status}`);
            }
            
            return response.json();
        } catch (error) {
            console.error(`Error calling ${functionName} with files:`, error);
            throw error;
        }
    }
    
    // Fallback consultation check function for when Edge Function is unavailable
    async function checkEligibilityFallback(email, phone) {
        try {
            // Try to check from local storage/sessionStorage for demo purposes
            const consultationHistory = JSON.parse(localStorage.getItem('consultationHistory') || '{}');
            const userKey = `${email}_${phone}`;
            
            if (consultationHistory[userKey]) {
                return {
                    hasUsedFreeConsultation: true,
                    consultationFee: 2000,
                    consultationCount: consultationHistory[userKey].count || 1,
                    freeConsultationUsed: true
                };
            }
            
            // First time user
            return {
                hasUsedFreeConsultation: false,
                consultationFee: 2000,
                consultationCount: 0,
                freeConsultationUsed: false
            };
        } catch (error) {
            console.error('Fallback check error:', error);
            // Default to first-time user if all else fails
            return {
                hasUsedFreeConsultation: false,
                consultationFee: 2000,
                consultationCount: 0,
                freeConsultationUsed: false
            };
        }
    }
    
    // State management
    let currentStep = 1;
    let isFirstTimeUser = true;
    let selectedPaymentMethod = null;
    let selectedConsultationType = 'office';
    let consultationFee = 2000;
    let currentTransactionId = null;
    let currentConsultationId = null;
    let uploadedDocuments = []; // Store uploaded documents
    
    // DOM Elements
    const steps = document.querySelectorAll('.form-step');
    const stepItems = document.querySelectorAll('.step-item');
    const progressLine = document.getElementById('progressLine');
    
    // ===== Calendar Date Picker =====
    let currentCalendarDate = new Date();
    const preferredDateDisplay = document.getElementById('preferredDateDisplay');
    const preferredDate = document.getElementById('preferredDate');
    const calendarPicker = document.getElementById('calendarPicker');
    const calendarDays = document.getElementById('calendarDays');
    const calendarMonth = document.getElementById('calendarMonth');
    const calendarPrevMonth = document.getElementById('calendarPrevMonth');
    const calendarNextMonth = document.getElementById('calendarNextMonth');
    
    function initializeCalendar() {
        // Set today as minimum date
        const today = new Date();
        currentCalendarDate = new Date(today);
        renderCalendar();
    }
    
    function renderCalendar() {
        const year = currentCalendarDate.getFullYear();
        const month = currentCalendarDate.getMonth();
        
        // Update month/year display
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];
        calendarMonth.textContent = `${monthNames[month]} ${year}`;
        
        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        
        // Clear previous days
        calendarDays.innerHTML = '';
        
        // Add empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            calendarDays.appendChild(emptyCell);
        }
        
        // Add day cells
        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('button');
            dayCell.type = 'button';
            dayCell.textContent = day;
            dayCell.style.cssText = `
                padding: 8px;
                border: 1px solid rgba(175, 169, 57, 0.2);
                background: #2A2D32;
                color: #ECECEC;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s ease;
            `;
            
            const cellDate = new Date(year, month, day);
            
            // Disable past dates
            if (cellDate < today && cellDate.toDateString() !== today.toDateString()) {
                dayCell.disabled = true;
                dayCell.style.opacity = '0.4';
                dayCell.style.cursor = 'not-allowed';
            } else {
                dayCell.addEventListener('hover', function() {
                    if (!this.disabled) {
                        this.style.background = 'rgba(175, 169, 57, 0.2)';
                    }
                });
                
                dayCell.addEventListener('mouseenter', function() {
                    if (!this.disabled) {
                        this.style.background = 'rgba(175, 169, 57, 0.3)';
                        this.style.borderColor = '#AFA939';
                    }
                });
                
                dayCell.addEventListener('mouseleave', function() {
                    if (!this.disabled && preferredDate.value !== cellDate.toISOString().split('T')[0]) {
                        this.style.background = '#2A2D32';
                        this.style.borderColor = 'rgba(175, 169, 57, 0.2)';
                    }
                });
                
                dayCell.addEventListener('click', function(e) {
                    e.preventDefault();
                    selectDate(cellDate);
                });
            }
            
            // Highlight selected date
            if (preferredDate.value === cellDate.toISOString().split('T')[0]) {
                dayCell.style.background = 'linear-gradient(135deg, #AFA939 0%, #B48811 100%)';
                dayCell.style.color = '#0F1113';
                dayCell.style.borderColor = '#AFA939';
                dayCell.style.fontWeight = '600';
            }
            
            calendarDays.appendChild(dayCell);
        }
    }
    
    function selectDate(date) {
        const dateString = date.toISOString().split('T')[0];
        preferredDate.value = dateString;
        
        // Format date for display
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        preferredDateDisplay.value = date.toLocaleDateString('en-US', options);
        
        // Close calendar and show success
        calendarPicker.style.display = 'none';
        showNotification('Date selected successfully!', 'success');
        
        // Re-render to highlight selected date
        renderCalendar();
    }
    
    // Calendar event listeners
    if (preferredDateDisplay && calendarPicker) {
        preferredDateDisplay.addEventListener('click', function(e) {
            e.stopPropagation();
            calendarPicker.style.display = calendarPicker.style.display === 'none' ? 'block' : 'none';
        });
        
        calendarPrevMonth.addEventListener('click', function(e) {
            e.preventDefault();
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
            renderCalendar();
        });
        
        calendarNextMonth.addEventListener('click', function(e) {
            e.preventDefault();
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
            renderCalendar();
        });
        
        // Close calendar when clicking outside
        document.addEventListener('click', function(e) {
            if (!calendarPicker.contains(e.target) && e.target !== preferredDateDisplay) {
                calendarPicker.style.display = 'none';
            }
        });
    }
    
    // Initialize calendar on page load
    initializeCalendar();
    
    // Check URL parameters for payment callback
    checkPaymentCallback();
    
    // ===== Step Navigation =====
    function showStep(stepNumber) {
        steps.forEach(step => step.classList.remove('active'));
        stepItems.forEach((item, index) => {
            item.classList.remove('active', 'completed');
            if (index + 1 < stepNumber) {
                item.classList.add('completed');
            } else if (index + 1 === stepNumber) {
                item.classList.add('active');
            }
        });
        
        const targetStep = document.getElementById('step' + stepNumber);
        if (targetStep) {
            targetStep.classList.add('active');
        }
        
        // Update progress line
        const progressPercent = ((stepNumber - 1) / 2) * 100;
        if (progressLine) {
            progressLine.style.width = progressPercent + '%';
        }
        
        currentStep = stepNumber;
        
        // Scroll to top of form
        document.querySelector('.consultation-form-wrap')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    function showSuccess(consultationData = {}) {
        steps.forEach(step => step.classList.remove('active'));
        stepItems.forEach(item => item.classList.add('completed'));
        if (progressLine) {
            progressLine.style.width = '100%';
        }
        
        // Update confirmation details
        if (consultationData.firstName) {
            document.getElementById('confirmName').textContent = `${consultationData.firstName} ${consultationData.lastName || ''}`;
        }
        if (consultationData.caseType) {
            document.getElementById('confirmCaseType').textContent = consultationData.caseType;
        }
        if (consultationData.preferredDate) {
            document.getElementById('confirmDate').textContent = consultationData.preferredDate;
        }
        if (consultationData.preferredTime) {
            document.getElementById('confirmTime').textContent = consultationData.preferredTime;
        }
        if (consultationData.email) {
            document.getElementById('confirmEmail').textContent = consultationData.email;
        }
        
        // Show consultation ID if available
        if (consultationData.id) {
            const confirmationRef = document.getElementById('confirmationRef');
            if (confirmationRef) {
                confirmationRef.textContent = consultationData.id.substring(0, 8).toUpperCase();
            }
        }
        
        document.getElementById('stepSuccess').classList.add('active');
    }
    
    function showError(message) {
        // Create error toast notification
        const toast = document.createElement('div');
        toast.className = 'toast-notification error';
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-exclamation-circle"></i>
                <span>${message}</span>
            </div>
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }
    
    function showNotification(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        const icon = type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle';
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${icon}"></i>
                <span>${message}</span>
            </div>
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
    
    // ===== Payment Callback Handler =====
    async function checkPaymentCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const status = urlParams.get('status');
        const tranId = urlParams.get('tran_id');
        const demo = urlParams.get('demo');
        
        if (status && tranId) {
            // Show loading state
            const loadingOverlay = document.createElement('div');
            loadingOverlay.className = 'loading-overlay';
            loadingOverlay.innerHTML = `
                <div class="loading-content">
                    <div class="spinner-border text-accent" role="status"></div>
                    <p class="mt-3">Verifying your payment...</p>
                </div>
            `;
            document.body.appendChild(loadingOverlay);
            
            try {
                // Verify payment with backend
                const verifyResult = await invokeEdgeFunction('payment-verify', {
                    transactionId: tranId,
                    status: status === 'success' ? 'VALID' : status,
                    valId: urlParams.get('val_id') || null
                });
                
                loadingOverlay.remove();
                
                if (verifyResult.success && verifyResult.verified) {
                    showNotification('Payment verified successfully!', 'success');
                    
                    // Show success with consultation data
                    const consultation = verifyResult.consultation || {};
                    
                    // Record paid consultation in local storage
                    if (consultation.email && consultation.phone) {
                        const consultationHistory = JSON.parse(localStorage.getItem('consultationHistory') || '{}');
                        const userKey = `${consultation.email}_${consultation.phone}`;
                        consultationHistory[userKey] = {
                            count: (consultationHistory[userKey]?.count || 0) + 1,
                            lastConsultation: new Date().toISOString(),
                            usedFreeConsultation: consultationHistory[userKey]?.usedFreeConsultation || false
                        };
                        localStorage.setItem('consultationHistory', JSON.stringify(consultationHistory));
                    }
                    
                    showSuccess({
                        id: consultation.id,
                        firstName: consultation.first_name,
                        lastName: consultation.last_name,
                        caseType: consultation.practice_area,
                        email: consultation.email,
                        preferredDate: 'To be confirmed',
                        preferredTime: 'To be confirmed'
                    });
                } else {
                    showError('Payment verification failed. Please contact support.');
                    // Clear URL parameters
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
            } catch (error) {
                loadingOverlay.remove();
                console.error('Payment verification error:', error);
                
                // For demo mode, simulate success
                if (demo === 'true') {
                    showNotification('Demo payment processed successfully!', 'success');
                    const storedData = sessionStorage.getItem('pendingConsultation');
                    if (storedData) {
                        const consultationData = JSON.parse(storedData);
                        showSuccess(consultationData);
                        sessionStorage.removeItem('pendingConsultation');
                    } else {
                        showSuccess({
                            firstName: 'Demo',
                            lastName: 'User',
                            caseType: 'Legal Consultation',
                            email: 'demo@example.com',
                            preferredDate: 'To be confirmed',
                            preferredTime: 'To be confirmed'
                        });
                    }
                } else {
                    showError('Unable to verify payment. Please contact support.');
                }
                
                // Clear URL parameters
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        }
    }
    
    // ===== Document Upload Handler =====
    const fileDropZone = document.getElementById('fileDropZone');
    const documentInput = document.getElementById('documentInput');
    const fileList = document.getElementById('fileList');
    
    if (fileDropZone && documentInput) {
        // Click to upload
        fileDropZone.addEventListener('click', () => documentInput.click());
        
        // Handle file selection
        documentInput.addEventListener('change', handleFileSelect);
        
        // Drag and drop
        fileDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileDropZone.style.borderColor = '#AFA939';
            fileDropZone.style.background = 'rgba(175, 169, 57, 0.15)';
        });
        
        fileDropZone.addEventListener('dragleave', () => {
            fileDropZone.style.borderColor = 'rgba(175, 169, 57, 0.5)';
            fileDropZone.style.background = 'rgba(175, 169, 57, 0.05)';
        });
        
        fileDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            fileDropZone.style.borderColor = 'rgba(175, 169, 57, 0.5)';
            fileDropZone.style.background = 'rgba(175, 169, 57, 0.05)';
            
            const files = e.dataTransfer.files;
            handleFiles(files);
        });
    }
    
    function handleFileSelect(e) {
        const files = e.target.files;
        handleFiles(files);
    }
    
    function handleFiles(files) {
        const maxFiles = 5;
        const maxFileSize = 10 * 1024 * 1024; // 10MB
        
        if (uploadedDocuments.length + files.length > maxFiles) {
            showError(`You can upload a maximum of ${maxFiles} files. You already have ${uploadedDocuments.length} file(s).`);
            return;
        }
        
        for (let file of files) {
            // Validate file size
            if (file.size > maxFileSize) {
                showError(`File "${file.name}" exceeds 10MB limit.`);
                continue;
            }
            
            // Validate file type
            const validTypes = ['application/pdf', 'application/msword', 
                              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                              'application/vnd.ms-excel',
                              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                              'image/jpeg', 'image/png', 'image/gif'];
            
            if (!validTypes.includes(file.type)) {
                showError(`File type "${file.type}" is not supported for "${file.name}".`);
                continue;
            }
            
            // Create file object with unique ID
            const fileObj = {
                id: Date.now() + Math.random(),
                name: file.name,
                size: file.size,
                type: file.type,
                file: file
            };
            
            uploadedDocuments.push(fileObj);
            showNotification(`Document "${file.name}" added successfully!`, 'success');
        }
        
        updateFileList();
    }
    
    function updateFileList() {
        fileList.innerHTML = '';
        
        if (uploadedDocuments.length === 0) {
            fileList.innerHTML = '<p class="text-muted mb-0">No documents uploaded yet.</p>';
            return;
        }
        
        const listHtml = `
            <div style="background: rgba(175, 169, 57, 0.05); border: 1px solid rgba(175, 169, 57, 0.2); border-radius: 8px; padding: 15px;">
                <p class="mb-3" style="color: #AFA939; font-weight: 600;">
                    <i class="fas fa-file-check me-2"></i>Uploaded Documents (${uploadedDocuments.length}/${5})
                </p>
                <div style="max-height: 300px; overflow-y: auto;">
                    ${uploadedDocuments.map(doc => `
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px; background: rgba(0, 0, 0, 0.2); border-radius: 6px; margin-bottom: 8px;" data-doc-id="${doc.id}">
                            <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
                                <i class="fas fa-${getFileIcon(doc.type)}" style="color: #AFA939; font-size: 16px;"></i>
                                <div>
                                    <p class="mb-0" style="font-weight: 500; color: #ECECEC; word-break: break-word;">${doc.name}</p>
                                    <small class="text-muted">${formatFileSize(doc.size)}</small>
                                </div>
                            </div>
                            <button type="button" class="btn btn-sm btn-danger remove-doc-btn" data-doc-id="${doc.id}" style="padding: 5px 10px; font-size: 12px;">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        fileList.innerHTML = listHtml;
        
        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-doc-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const docId = parseFloat(this.getAttribute('data-doc-id'));
                window.removeDocument(docId);
            });
        });
    }
    
    function getFileIcon(mimeType) {
        if (mimeType.includes('pdf')) return 'file-pdf';
        if (mimeType.includes('word') || mimeType.includes('document')) return 'file-word';
        if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'file-excel';
        if (mimeType.includes('image')) return 'file-image';
        return 'file';
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
    
    // Make removeDocument globally accessible
    window.removeDocument = function(fileId) {
        uploadedDocuments = uploadedDocuments.filter(doc => doc.id !== fileId);
        updateFileList();
        showNotification('Document removed.', 'info');
    };
    
    // ===== Step 1: Eligibility Check =====
    const checkEligibilityBtn = document.getElementById('checkEligibility');
    if (checkEligibilityBtn) {
        checkEligibilityBtn.addEventListener('click', async function() {
            const email = document.getElementById('checkEmail').value.trim();
            const phone = document.getElementById('checkPhone').value.trim();
            
            if (!email || !phone) {
                showError('Please enter both email and phone number.');
                return;
            }
            
            // Validate email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showError('Please enter a valid email address.');
                return;
            }
            
            // Validate Bangladesh phone number
            const phoneRegex = /^01[3-9]\d{8}$/;
            const cleanPhone = phone.replace(/[-\s+]/g, '');
            if (!phoneRegex.test(cleanPhone)) {
                showError('Please enter a valid Bangladesh mobile number (e.g., 01XXX-XXXXXX).');
                return;
            }
            
            // Show loading state
            this.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Checking...';
            this.disabled = true;
            
            try {
                // Call backend API to check consultation history
                let result;
                try {
                    result = await invokeEdgeFunction('consultation-check', {
                        email: email,
                        phone: cleanPhone
                    });
                } catch (apiError) {
                    console.warn('Edge Function unavailable, using fallback:', apiError);
                    result = await checkEligibilityFallback(email, cleanPhone);
                }
                
                isFirstTimeUser = !result.hasUsedFreeConsultation;
                consultationFee = result.consultationFee || 2000;
                
                // Update eligibility status
                const statusDiv = document.getElementById('eligibilityStatus');
                if (isFirstTimeUser) {
                    statusDiv.innerHTML = `
                        <div class="eligibility-free d-flex align-items-center">
                            <i class="fas fa-check-circle fa-2x me-3"></i>
                            <div>
                                <strong>Great news! You're eligible for a FREE consultation.</strong><br>
                                <small class="text-muted">This is your first consultation with us.</small>
                            </div>
                        </div>
                    `;
                    document.getElementById('paymentSection').style.display = 'none';
                    document.getElementById('submitBtnText').textContent = 'Schedule Consultation';
                } else {
                    statusDiv.innerHTML = `
                        <div class="eligibility-paid d-flex align-items-center">
                            <i class="fas fa-info-circle fa-2x me-3"></i>
                            <div>
                                <strong>Welcome back! A consultation fee applies.</strong><br>
                                <small class="text-muted">Consultation Fee: BDT ${consultationFee.toLocaleString()} (payable via bKash, Nagad, Rocket, or Card)</small>
                                <br><small class="text-muted">Previous consultations: ${result.consultationCount || 1}</small>
                            </div>
                        </div>
                    `;
                    document.getElementById('paymentSection').style.display = 'block';
                    document.getElementById('submitBtnText').textContent = 'Pay & Schedule';
                    
                    // Update fee display
                    const feeDisplay = document.querySelector('#paymentSection .text-accent');
                    if (feeDisplay) {
                        feeDisplay.textContent = `BDT ${consultationFee.toLocaleString()}`;
                    }
                }
                
                showNotification(isFirstTimeUser ? 'You qualify for a free consultation!' : 'Eligibility verified', 'success');
                
                // Go to step 2
                showStep(2);
                
            } catch (error) {
                console.error('Eligibility check error:', error);
                showError('Unable to check eligibility. Please try again.');
            } finally {
                // Reset button
                this.innerHTML = 'Check Eligibility <i class="fas fa-arrow-right ms-2"></i>';
                this.disabled = false;
            }
        });
    }
    
    // ===== Step 2 Navigation =====
    const backToStep1Btn = document.getElementById('backToStep1');
    if (backToStep1Btn) {
        backToStep1Btn.addEventListener('click', () => showStep(1));
    }
    
    const goToStep3Btn = document.getElementById('goToStep3');
    if (goToStep3Btn) {
        goToStep3Btn.addEventListener('click', function() {
            const firstName = document.getElementById('firstName').value.trim();
            const lastName = document.getElementById('lastName').value.trim();
            const caseType = document.getElementById('caseType').value;
            const urgency = document.getElementById('urgency').value;
            const description = document.getElementById('caseDescription').value.trim();
            
            if (!firstName || !lastName || !caseType || !urgency || !description) {
                showError('Please fill in all required fields.');
                return;
            }
            
            if (description.length < 20) {
                showError('Please provide a more detailed description of your case (at least 20 characters).');
                return;
            }
            
            showStep(3);
        });
    }
    
    // ===== Step 3 Navigation =====
    const backToStep2Btn = document.getElementById('backToStep2');
    if (backToStep2Btn) {
        backToStep2Btn.addEventListener('click', () => showStep(2));
    }
    
    // ===== Consultation Type Selection =====
    const consultationTypeCards = document.querySelectorAll('.consultation-type-card');
    consultationTypeCards.forEach(card => {
        card.addEventListener('click', function() {
            consultationTypeCards.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            selectedConsultationType = this.dataset.type;
        });
    });
    
    // ===== Payment Method Selection =====
    const paymentMethodCards = document.querySelectorAll('.payment-method-card');
    paymentMethodCards.forEach(card => {
        card.addEventListener('click', function() {
            paymentMethodCards.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            selectedPaymentMethod = this.dataset.method;
        });
    });
    
    // ===== Form Submission =====
    const submitBtn = document.getElementById('submitConsultation');
    if (submitBtn) {
        submitBtn.addEventListener('click', async function() {
            const preferredDate = document.getElementById('preferredDate').value;
            const preferredTime = document.getElementById('preferredTime').value;
            const termsCheck = document.getElementById('termsCheck').checked;
            
            if (!preferredDate || !preferredTime) {
                showError('Please select your preferred date and time.');
                return;
            }
            
            if (!termsCheck) {
                showError('Please agree to the Terms of Service and Privacy Policy.');
                return;
            }
            
            // If payment required, check payment method
            if (!isFirstTimeUser && !selectedPaymentMethod) {
                showError('Please select a payment method.');
                return;
            }
            
            // Gather form data
            const email = document.getElementById('checkEmail').value.trim();
            const phone = document.getElementById('checkPhone').value.replace(/[-\s+]/g, '');
            const firstName = document.getElementById('firstName').value.trim();
            const lastName = document.getElementById('lastName').value.trim();
            const caseType = document.getElementById('caseType').value;
            const urgency = document.getElementById('urgency').value;
            const description = document.getElementById('caseDescription').value.trim();
            const additionalNotes = document.getElementById('additionalNotes')?.value.trim() || '';
            
            const consultationData = {
                email,
                phone,
                firstName,
                lastName,
                practiceArea: caseType,
                message: `${description}\n\nUrgency: ${urgency}\nConsultation Type: ${selectedConsultationType}\nPreferred Date: ${preferredDate}\nPreferred Time: ${preferredTime}\n${additionalNotes ? 'Additional Notes: ' + additionalNotes : ''}`,
                preferredDate,
                preferredTime,
                consultationType: selectedConsultationType,
                documentsCount: uploadedDocuments.length,
                documentNames: uploadedDocuments.map(doc => doc.name)
            };
            
            // Show loading state
            this.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';
            this.disabled = true;
            
            try {
                if (isFirstTimeUser) {
                    // Submit free consultation with or without documents
                    let result;
                    if (uploadedDocuments.length > 0) {
                        result = await invokeEdgeFunctionWithFiles('submit-consultation', {
                            ...consultationData,
                            isFree: true
                        }, uploadedDocuments);
                    } else {
                        result = await invokeEdgeFunction('submit-consultation', {
                            ...consultationData,
                            isFree: true
                        });
                    }
                    
                    if (result.success) {
                        // Record this consultation in local storage for future eligibility checks
                        const consultationHistory = JSON.parse(localStorage.getItem('consultationHistory') || '{}');
                        const userKey = `${email}_${phone}`;
                        consultationHistory[userKey] = {
                            count: (consultationHistory[userKey]?.count || 0) + 1,
                            lastConsultation: new Date().toISOString(),
                            usedFreeConsultation: true
                        };
                        localStorage.setItem('consultationHistory', JSON.stringify(consultationHistory));
                        
                        showNotification('Consultation scheduled successfully!', 'success');
                        showSuccess({
                            id: result.consultation?.id,
                            firstName,
                            lastName,
                            caseType,
                            email,
                            preferredDate,
                            preferredTime
                        });
                    } else {
                        throw new Error(result.error || 'Failed to submit consultation');
                    }
                } else {
                    // Initiate payment for returning users
                    sessionStorage.setItem('pendingConsultation', JSON.stringify({
                        firstName,
                        lastName,
                        caseType,
                        email,
                        preferredDate,
                        preferredTime
                    }));
                    
                    let paymentResult;
                    if (uploadedDocuments.length > 0) {
                        paymentResult = await invokeEdgeFunctionWithFiles('payment-initiate', {
                            ...consultationData,
                            returnUrl: window.location.href.split('?')[0],
                            paymentMethod: selectedPaymentMethod
                        }, uploadedDocuments);
                    } else {
                        paymentResult = await invokeEdgeFunction('payment-initiate', {
                            ...consultationData,
                            returnUrl: window.location.href.split('?')[0],
                            paymentMethod: selectedPaymentMethod
                        });
                    }
                    
                    if (paymentResult.success) {
                        currentTransactionId = paymentResult.transactionId;
                        currentConsultationId = paymentResult.consultationId;
                        
                        showNotification('Redirecting to payment gateway...', 'info');
                        
                        // Redirect to payment gateway
                        if (paymentResult.gatewayUrl) {
                            setTimeout(() => {
                                window.location.href = paymentResult.gatewayUrl;
                            }, 1500);
                        } else {
                            // For demo, simulate successful payment
                            showNotification('Demo mode: Simulating payment...', 'warning');
                            setTimeout(() => {
                                window.location.href = `${window.location.pathname}?status=success&tran_id=${currentTransactionId}&demo=true`;
                            }, 2000);
                        }
                    } else {
                        throw new Error(paymentResult.error || 'Failed to initiate payment');
                    }
                }
            } catch (error) {
                console.error('Submission error:', error);
                showError(error.message || 'An error occurred. Please try again.');
                
                // Reset button
                this.innerHTML = `<span id="submitBtnText">${isFirstTimeUser ? 'Schedule Consultation' : 'Pay & Schedule'}</span><i class="fas fa-calendar-check ms-2"></i>`;
                this.disabled = false;
            }
        });
    }
    
    // ===== Add Toast Notification Styles =====
    const toastStyles = document.createElement('style');
    toastStyles.textContent = `
        .toast-notification {
            position: fixed;
            top: 100px;
            right: 20px;
            z-index: 9999;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            transform: translateX(120%);
            transition: transform 0.3s ease;
            max-width: 400px;
        }
        
        .toast-notification.show {
            transform: translateX(0);
        }
        
        .toast-notification.success {
            background: linear-gradient(135deg, #1a472a 0%, #2d5a3d 100%);
            border-left: 4px solid #4CAF50;
        }
        
        .toast-notification.error {
            background: linear-gradient(135deg, #4a1a1a 0%, #5a2d2d 100%);
            border-left: 4px solid #f44336;
        }
        
        .toast-notification.warning {
            background: linear-gradient(135deg, #4a3a1a 0%, #5a4a2d 100%);
            border-left: 4px solid #ff9800;
        }
        
        .toast-notification.info {
            background: linear-gradient(135deg, #1a3a4a 0%, #2d4a5a 100%);
            border-left: 4px solid #2196F3;
        }
        
        .toast-content {
            display: flex;
            align-items: center;
            gap: 12px;
            color: #fff;
        }
        
        .toast-content i {
            font-size: 20px;
        }
        
        .toast-notification.success .toast-content i { color: #4CAF50; }
        .toast-notification.error .toast-content i { color: #f44336; }
        .toast-notification.warning .toast-content i { color: #ff9800; }
        .toast-notification.info .toast-content i { color: #2196F3; }
        
        .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(10, 10, 10, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
        }
        
        .loading-content {
            text-align: center;
            color: #fff;
        }
        
        .loading-content .spinner-border {
            width: 50px;
            height: 50px;
        }
        
        .text-accent {
            color: #AFA939 !important;
        }
        
        .eligibility-free {
            background: rgba(76, 175, 80, 0.1);
            border: 1px solid rgba(76, 175, 80, 0.3);
            border-radius: 8px;
            padding: 16px;
            color: #4CAF50;
        }
        
        .eligibility-free strong {
            color: #4CAF50;
        }
        
        .eligibility-paid {
            background: rgba(175, 169, 57, 0.1);
            border: 1px solid rgba(175, 169, 57, 0.3);
            border-radius: 8px;
            padding: 16px;
            color: #AFA939;
        }
        
        .eligibility-paid strong {
            color: #AFA939;
        }
    `;
    document.head.appendChild(toastStyles);
});
