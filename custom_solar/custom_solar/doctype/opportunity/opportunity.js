frappe.ui.form.on('Opportunity', {
    onload: function(frm){
        load_site_visit_data(frm); 

    },
    refresh: function(frm) {
        add_custom_tabs(frm); // Ensure tabs are added
        load_site_visit_data(frm); // Load Site Visit data for the opened lead

        // Set Site Visit as the default tab when opening a new Opportunity
        $('#site-visit-tab').addClass('active');
        $('#activity-tab').removeClass('active');
        $('#quotation-tab').removeClass('active');
    
        // Show Site Visit content and hide Activity content initially
        $('#site-visit-content').show();
        frm.timeline.timeline_items_wrapper.hide();  // Hide Activity by default
        frm.timeline.wrapper.find('.timeline-item').hide(); // Hide the timeline items (Activity)
        $('#activity-content, #quotation-content').hide();

        // Add Save Button at the bottom if not already added
        if (!frm.custom_save_button) {
            let save_button = $('<button class="btn btn-primary mt-4" style="float: right;">Save</button>').click(() => frm.save());
            $(frm.fields_dict[Object.keys(frm.fields_dict).pop()].wrapper).append(save_button);
            frm.custom_save_button = true;
        }
        
    }
});

function add_custom_tabs(frm) {
    if (!frm.custom_tabs_added) {
        let timeline_wrapper = frm.timeline.wrapper;

        // Create the tab buttons and the tab content structure for Site Visit and Activity
        let tab_html = `
        <ul class="nav nav-tabs" id="customTab" role="tablist">
            <li class="nav-item">
                <a class="nav-link active" id="site-visit-tab" role="tab">Site Visit</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" id="activity-tab" role="tab">Activity</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" id="quotation-tab" role="tab">Quotation</a>
            </li>

        </ul>
        <div class="tab-content mt-3">
            <div class="tab-pane fade show active" id="site-visit-content" role="tabpanel">
                <!-- Site Visit logic will go here -->
            </div>
            <div class="tab-pane fade" id="activity-content" role="tabpanel">
                <!-- Activity logic will go here -->
            </div>
            <div class="tab-pane fade" id="quotation-content" role="tabpanel"></div>
        </div>`;

        // Append the custom tabs to the timeline wrapper
        $(timeline_wrapper).prepend(tab_html);
        load_site_visit_data(frm);

        $(document).ready(function () {
            // Tab switching helper function
            function switchTab(activeTab, activeContent) {
                
                // Remove active class from all tabs and content
                $('#site-visit-tab, #activity-tab, #quotation-tab').removeClass('active');
                $('.tab-pane').removeClass('show active').css('opacity', '0'); // add css to for show quotation contant
                $('#site-visit-content, #activity-content, #quotation-content').hide();
                frm.timeline.timeline_items_wrapper.hide();

                // Set active tab and content
                $(activeTab).addClass('active');
                $(activeContent).show();
                $(activeContent).addClass('show active').css('opacity', '1'); // Force visibility
            }

            // Show Site Visit tab by default
            switchTab('#site-visit-tab', '#site-visit-content');

            // Handle Site Visit tab click
            $('#site-visit-tab').on('click', function () {
                switchTab('#site-visit-tab', '#site-visit-content');
                frm.timeline.timeline_items_wrapper.hide();
                frm.timeline.wrapper.find('.timeline-item').hide(); // Hide Activity content         
            });

            // Handle Activity tab click
            $('#activity-tab').on('click', function () {
                switchTab('#activity-tab', '#activity-content');
                frm.timeline.timeline_items_wrapper.show();
                frm.timeline.wrapper.find('.timeline-item').show();

                // Hide the div with class 'timeline-items timeline-actions'
                frm.timeline.wrapper.find('.timeline-items.timeline-actions').hide(); 
                frm.timeline.wrapper.find('.d-flex.align-items-center.show-all-activity').removeClass('d-flex').hide(); 
        
            });

            // Handle Quotation tab click
            $('#quotation-tab').on('click', function () {
                switchTab('#quotation-tab', '#quotation-content');
                frm.timeline.timeline_items_wrapper.hide();
                frm.timeline.wrapper.find('.timeline-item').hide(); // Hide Activity content        
                load_quotation_data(frm);     
            });
        });

        frm.custom_tabs_added = true;
    }
}

function load_site_visit_data(frm) {
    $('#site-visit-content').html('');  // Clear previous Site Visit data
 
    frm.timeline.timeline_items_wrapper.hide();
    frm.timeline.wrapper.find('.timeline-item').hide(); // Hide Activity content
 
    frm.timeline.timeline_items_wrapper.show(); // Ensure timeline is visible
 

    frm.timeline.timeline_items_wrapper.hide();
    frm.timeline.wrapper.find('.timeline-item').hide(); // Hide Activity content
 
    frm.timeline.timeline_items_wrapper.show(); // Ensure timeline is visible

    frappe.call({
        method: 'custom_solar.custom_solar.doctype.leads.leads.get_site_visit_history',
        args: { lead: frm.doc.lead_id },
        callback: function(response) {
            let visits = response.message || [];
            let content = '';

            visits.forEach((visit, index) => {
                content += `
                   <div class="site-visit-details card p-4 mb-4">
                        <h5>Site Visit</h5>

                        <!-- Row with 4 values -->
                        <div class="row mb-3">
                            <div class="col-md-3">
                                <div><strong>Lead Owner:</strong></div>
                                <div>${visit.lead_owner || '-'}</div>
                            </div>
                            <div class="col-md-3">
                                <div><strong>Cantilever Position:</strong></div>
                                <div>${visit.cantilever_position || '-'}</div>
                            </div>
                            <div class="col-md-3">
                                <div><strong>Shadow Object/Analysis:</strong></div>
                                <div>${visit.shadow_object_analysis || '-'}</div>
                            </div>
                            <div class="col-md-3">
                                <div><strong>Roof Type:</strong></div>
                                <div>${visit.roof_type || '-'}</div>
                            </div>

                        </div>

                        <!-- Row with another 4 values -->
                        <div class="row mb-3">
                            <div class="col-md-3">
                                <div><strong>Structure Type:</strong></div>
                                <div>${visit.structure_type || '-'}</div>
                            </div>
                            <div class="col-md-3">
                                <div><strong>Sanction Load:</strong></div>
                                <div>${visit.sanction_load || '-'}</div>
                            </div>
                            <div class="col-md-3">
                                <div><strong>No. of Floors:</strong></div>
                                <div>${visit.no_of_floor || '-'}</div>
                            </div>
                            <div class="col-md-3">
                                <div><strong>Remarks:</strong></div>
                                <div>${visit.remarks || '-'}</div>
                            </div>

                        </div>

                        <!-- Row with additional 4 values -->
                        <div class="row mb-3">
                            <div class="col-md-3">
                                <div><strong>2D Diagram of Site:</strong></div>
                                <div>
                                    ${visit['2d_diagram_of_site'] ? `<a href="${visit['2d_diagram_of_site']}" target="_blank" style="color: blue;">View Diagram</a>` : '-'}
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div><strong>Site Image:</strong></div>
                                <div>
                                    ${visit.site_image ? `<a href="${visit.site_image}" target="_blank" style="color: blue;">View Image</a>` : '-'}
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div><strong>Site Video:</strong></div>
                                <div>
                                    ${visit.site_video ? `<a href="${visit.site_video}" target="_blank" style="color: blue;">View Video</a>` : '-'}
                                </div>
                            </div>
                        </div>
                    </div>
               `;
            });

            $('#site-visit-content').html(content); // Display Site Visit data
        }
    });
}

function load_quotation_data(frm) {
    $('#quotation-content').html('');  // Clear previous Quotation data

    frm.timeline.timeline_items_wrapper.hide();
    frm.timeline.wrapper.find('.timeline-item').hide(); // Hide Activity content
    $('#site-visit-content').hide();  // Hide Site Visit content

    frappe.call({
        method: 'custom_solar.custom_solar.doctype.leads.leads.get_quotation_ids',
        args: { lead_id: frm.doc.name },
        callback: function(response) {
            let quotations = response.message || [];
            let content = '';

            if (quotations.length === 0) {
                content = `<div class="alert alert-warning">No quotations found for this lead.</div>`;
            } else {
                quotations.forEach((quotation, index) => {
                    // color of status
                    let status_badge_color = quotation.status === 'Accepted' ? 'success' : 
                                             (quotation.status === 'Rejected' ? 'danger' :
                                             (quotation.status === 'Pending' ? 'warning' : 'secondary'));
            
                    // Condition for showing button accept ar reject button will hide
                    let buttons = '';
                    if (quotation.status != 'Accepted' && quotation.status !== 'Rejected') {
                        buttons = `
                            <button class="btn btn-success btn-sm update-status accept-btn" data-id="${quotation.name}" data-status="Accepted">Accept</button>
                            <button class="btn btn-danger btn-sm update-status reject-btn" data-id="${quotation.name}" data-status="Rejected">Reject</button>
                        `;
                    }
                    else{
                        buttons='';
                    }

                    
                    // Add text-white only for Accepted and Rejected
                    let text_white_class = (quotation.status === 'Accepted' || quotation.status === 'Rejected') ? 'text-white' : '';

                    // Add PDF button
                    buttons += `
                        <button class="btn btn-primary btn-sm pdf-btn" data-id="${quotation.name}">PDF</button>
                    `;
            
                    content += `
                        <div class="quotation-details card p-3 mb-3">
                            <div class="d-flex justify-content-between align-items-center">
                                <!-- Quotation ID -->
                                <div class="quotation-id">
                                    <strong>Quotation ID:</strong> ${quotation.name || '-'}
                                </div>
            
                                <!-- Status Badge -->
                                <div class="status">
                                    <strong>Status:</strong> 
                                    <span class="badge bg-${status_badge_color} ${text_white_class} p-1.5 " style="font-size: 0.8rem;"  id="status-${quotation.name}">${quotation.status || 'Pending'}
                                </span></div>
            
                                <!-- Buttons -->
                                <div class="actions">
                                    ${buttons}
                                </div>
                            </div>

                            <!-- Show Rejection Reason only if status is Rejected -->
                            ${quotation.status === 'Rejected' ? `
                                <div class="mt-2">
                                    <strong>Rejection Reason:</strong> ${quotation.rejection_reason || 'Not Provided'}
                                </div>
                            ` : ''}
                        </div>`;
                });
            }
            

            $('#quotation-content').html(content);
            $('.update-status').on('click', function () {
                let quotation_id = $(this).data('id');
                let new_status = $(this).data('status');

                // Show confirmation dialog for Accept & Reject
                let confirmation_message = `Are you sure you want to ${new_status.toLowerCase()} this quotation?`;

                frappe.confirm(
                    confirmation_message,
                    function () {
                        if (new_status === 'Accepted') {
                            //  Accepting the quotation
                            frappe.call({
                                method: 'frappe.client.set_value',
                                args: {
                                    doctype: 'Quotations',
                                    name: quotation_id,
                                    fieldname: 'status',
                                    value: 'Accepted'
                                },
                                callback: function (response) {
                                    if (!response.exc) {
                                        $(`#status-${quotation_id}`).text('Accepted').removeClass('bg-secondary bg-danger bg-warning').addClass('bg-success text-white');
                                        frappe.msgprint(`Quotation ${quotation_id} has been accepted.`);
                                        
                                        // Hide Accept & Reject buttons
                                        $(`button.reject-btn[data-id="${quotation_id}"]`).hide();
                                        $(`button.accept-btn[data-id="${quotation_id}"]`).hide();

                                        // Update Lead status to Closed
                                        frappe.call({
                                            method: 'frappe.client.set_value',
                                            args: {     
                                                doctype: 'Leads',
                                                name: frm.doc.name,
                                                fieldname: 'status',
                                                value: 'Closed'
                                            },
                                            callback: function() {
                                                frappe.msgprint(`Lead status updated to Closed`);
                                                frm.reload_doc();
                                            }
                                        });
                                    }
                                }
                            });
                        } 
                        else if (new_status === 'Rejected') {
                            //  Rejection - Show Prompt for Rejection Reason
                            frappe.prompt(
                                [
                                    {
                                        label: 'Rejection Reason',
                                        fieldname: 'rejection_reason',
                                        fieldtype: 'Small Text',
                                        reqd: 1
                                    }
                                ],
                                function (values) {
                                    let rejection_reason = values.rejection_reason;

                                    // Update Quotation with Rejected Status & Reason
                                    frappe.call({
                                        method: 'frappe.client.set_value',
                                        args: {
                                            doctype: 'Quotations',
                                            name: quotation_id,
                                            fieldname: { 'status': 'Rejected', 'rejection_reason': rejection_reason }
                                        },
                                        callback: function (response) {
                                            if (!response.exc) {
                                                $(`#status-${quotation_id}`).text('Rejected').removeClass('bg-secondary bg-success bg-warning').addClass('bg-danger text-white');
                                                frappe.msgprint(`Quotation ${quotation_id} has been rejected. Reason: ${rejection_reason}`);

                                                // Hide Accept & Reject buttons
                                                $(`button.reject-btn[data-id="${quotation_id}"]`).hide();
                                                $(`button.accept-btn[data-id="${quotation_id}"]`).hide();
                                                frm.reload_doc();
                                            }
                                        }
                                    });
                                },
                                'Rejection Reason',
                                'Submit'
                            );
                        }
                    }
                );
            });

        }
    });
}