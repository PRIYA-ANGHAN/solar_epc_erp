frappe.ui.form.on('Opportunity', {
    refresh(frm) {
        add_custom_tabs(frm); // Ensure tabs are added
        load_site_visit_data(frm); // Load Site Visit data for the opened lead
        load_activity_data(frm);  // Load Activity data (as part of timeline)

        // Set Site Visit as the default tab when opening a new Opportunity
        $('#site-visit-tab').addClass('active');
        $('#activity-tab').removeClass('active');
    
        // Show Site Visit content and hide Activity content initially
        $('#site-visit-content').show();
        frm.timeline.timeline_items_wrapper.hide();  // Hide Activity by default
        frm.timeline.wrapper.find('.timeline-item').hide(); // Hide the timeline items (Activity)
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
        </ul>
        <div class="tab-content mt-3">
            <div class="tab-pane fade show active" id="site-visit-content" role="tabpanel">
                <!-- Site Visit logic will go here -->
            </div>
            <div class="tab-pane fade" id="activity-content" role="tabpanel">
                <!-- Activity logic will go here -->
            </div>
        </div>`;

        // Append the custom tabs to the timeline wrapper
        $(timeline_wrapper).prepend(tab_html);

        // Bind Activity tab click event to toggle visibility of content
        $('#activity-tab').on('click', function() {
            $('#site-visit-content').hide();  // Hide Site Visit content
            frm.timeline.timeline_items_wrapper.show(); // Show Activity content (via Timeline items)
            frm.timeline.wrapper.find('.timeline-item').show(); // Show the timeline items (Activity)

            // Update the active class for tabs
            $('#site-visit-tab').removeClass('active');
            $('#activity-tab').addClass('active');
        });

        // Bind Site Visit tab click event to toggle visibility of content
        $('#site-visit-tab').on('click', function() {
            frm.timeline.timeline_items_wrapper.hide();  // Hide Activity content
            frm.timeline.wrapper.find('.timeline-item').hide();  // Hide the timeline items (Activity)
            $('#site-visit-content').show(); // Show Site Visit content

            // Update the active class for tabs
            $('#activity-tab').removeClass('active');
            $('#site-visit-tab').addClass('active');
        });

        frm.custom_tabs_added = true;  // Prevent duplicate tabs
    }
}

function load_site_visit_data(frm) {
    $('#site-visit-content').html('');  // Clear previous Site Visit data

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
                                <div><strong>Lead:</strong></div>
                                <div>${visit.lead || '-'}</div>
                            </div>
                            <div class="col-md-3">
                                <div><strong>Shadow Object/Analysis:</strong></div>
                                <div>${visit.shadow_object_analysis || '-'}</div>
                            </div>
                        </div>

                        <!-- Row with another 4 values -->
                        <div class="row mb-3">
                            <div class="col-md-3">
                                <div><strong>Roof Type:</strong></div>
                                <div>${visit.roof_type || '-'}</div>
                            </div>
                            <div class="col-md-3">
                                <div><strong>Structure Type:</strong></div>
                                <div>${visit.structure_type || '-'}</div>
                            </div>
                            <div class="col-md-3">
                                <div><strong>Sanction Load:</strong></div>
                                <div>${visit.sanction_load || '-'}</div>
                            </div>
                            <div class="col-md-3">
                                <div><strong>Is Same Name:</strong></div>
                                <div>${visit.is_same_name || '-'}</div>
                            </div>
                        </div>

                        <!-- Row with No. of Floors and others -->
                        <div class="row mb-3">
                            <div class="col-md-3">
                                <div><strong>No. of Floors:</strong></div>
                                <div>${visit.no_of_floor || '-'}</div>
                            </div>
                            <div class="col-md-3">
                                <div><strong>Final Note:</strong></div>
                                <div>${visit.final_note || '-'}</div>
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

function load_activity_data(frm) {
    // Hide Activity content initially
    frm.timeline.timeline_items_wrapper.hide();
    frm.timeline.wrapper.find('.timeline-item').hide();
    frm.timeline.timeline_items_wrapper.show();

    // let old_status = frm.doc.status;  // Get the current status before change
    // let new_status = frm.doc.status;  // Get the actual changed status
    // let comment = "Viewing activity logs"; // Optional comment

    frappe.call({
        method: 'custom_solar.custom_solar.doctype.leads.leads.log_status_change',
        args: {
            docname: frm.doc.lead_id,  
            old_status: old_status,  
            new_status: new_status,  // Use actual status
            comment: comment  
        },
        callback: function(response) {
            let activities = response.message || [];
            let content = '';

            activities.forEach((activity) => {
                content += `<div class="activity-log">${activity.content || 'No content available.'}</div>`;
            });

            $('#activity-content').html(content);
        }
    });
}
