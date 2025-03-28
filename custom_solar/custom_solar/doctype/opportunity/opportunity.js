
// //  =========== =========== ============== ===================

// frappe.ui.form.on('Opportunity', {
//     refresh: function(frm) {
//         add_custom_timeline_tabs(frm);

//         if (!frm.custom_tabs_added) {
//             add_custom_timeline_tabs(frm);
//         }

//         load_site_visit_data(frm);

//         $('#site-visit-tab').addClass('active');
//         $('#activity-tab').removeClass('active');
//         $('#quotation-tab').removeClass('active');

//         $('#site-visit-content').show();
//         frm.timeline.timeline_items_wrapper.hide();
//         frm.timeline.wrapper.find('.timeline-item').hide();
//         $('#activity-content').hide();
//         $('#quotation-content').hide();
//     },

//     onload: function(frm) {
//         add_custom_timeline_tabs(frm);
//         load_site_visit_data(frm);
//     }
// });

// function add_custom_timeline_tabs(frm) {
//     if (!frm.custom_tabs_added) {
//         let timeline_wrapper = frm.timeline.wrapper;
 
//         let tab_html = `
//         <ul class="nav nav-tabs" id="customTab" role="tablist">
//             <li class="nav-item">
//                 <a class="nav-link active" id="site-visit-tab" role="tab">Site Visit</a>
//             </li>
//             <li class="nav-item">
//                 <a class="nav-link" id="activity-tab" role="tab">Activity</a>
//             </li>
//             <li class="nav-item">
//                 <a class="nav-link" id="quotation-tab" role="tab">Quotation</a>
//             </li>
//         </ul>
//         <div class="tab-content mt-3">
//             <div class="tab-pane fade show active" id="site-visit-content" role="tabpanel"></div>
//             <div class="tab-pane fade" id="activity-content" role="tabpanel"></div>
//             <div class="tab-pane fade" id="quotation-content" role="tabpanel"></div>
//         </div>`;
 
//         $(timeline_wrapper).prepend(tab_html);
//         load_site_visit_data(frm);

//         $('#activity-tab').on('click', function() {
//             frm.timeline.timeline_items_wrapper.show();
//             frm.timeline.wrapper.find('.timeline-item').show();
//             $('#quotation-content').hide();
//             $('#site-visit-content').hide();
//             $('#activity-tab').addClass('active');
//             $('#site-visit-tab').removeClass('active');
//             $('#quotation-tab').removeClass('active');
//             frm.timeline.wrapper.find('.timeline-items.timeline-actions').hide(); 
//             frm.timeline.wrapper.find('.d-flex.align-items-center.show-all-activity').removeClass('d-flex').hide();
//         });

//         $('#site-visit-tab').on('click', function() {
//             frm.timeline.timeline_items_wrapper.hide();
//             frm.timeline.wrapper.find('.timeline-item').hide();
//             $('#quotation-content').hide();
//             $('#site-visit-content').show();
//             $('#site-visit-tab').addClass('active'); 
//             $('#activity-tab').removeClass('active');
//             $('#quotation-tab').removeClass('active');
//         });

//         $('#quotation-tab').on('click', function() {
//             frm.timeline.timeline_items_wrapper.hide();
//             frm.timeline.wrapper.find('.timeline-item').hide();
//             $('#site-visit-content').hide();
//             $('#quotation-content').show();
//             $('#activity-tab').removeClass('active');
//             $('#quotation-tab').addClass('active');
//             $('#site-visit-tab').removeClass('active');
//             load_quotation_data(frm);
//         });

//         frm.custom_tabs_added = true;
//     }
// }
// function load_site_visit_data(frm) {
//     $('#site-visit-content').html('');
//     frm.timeline.timeline_items_wrapper.hide();
//     frm.timeline.wrapper.find('.timeline-item').hide();
//     $('#quotation-content').hide();

//     console.log("Fetching Site Visit data for:", frm.doc.name);

//     frappe.call({
//         method: 'custom_solar.custom_solar.doctype.leads.leads.get_site_visit_history',
//         args: { lead: frm.doc.name },
//         callback: function(response) {
//             console.log("Site Visit API Response:", response);

//             if (response.exc) {
//                 console.error("Error fetching Site Visit data:", response.exc);
//                 frappe.msgprint("Failed to fetch Site Visit data.");
//                 return;
//             }

//             let visits = response.message || [];
//             let content = '';

//             visits.forEach((visit) => {
//                 content += `
//                     <div class="site-visit-details card p-4 mb-4">
//                         <h5 class="mb-3">Site Visit</h5>
//                         <div class="table-responsive">
//                             <table class="table table-bordered">
//                                 <thead class="thead-light">
//                                     <tr>
//                                         <th>Lead Owner</th>
//                                         <th>Cantilever Position</th>
//                                         <th>Shadow Object/Analysis</th>
//                                         <th>Roof Type</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     <tr>
//                                         <td>${visit.lead_owner || '-'}</td>
//                                         <td>${visit.cantilever_position || '-'}</td>
//                                         <td>${visit.shadow_object_analysis || '-'}</td>
//                                         <td>${visit.roof_type || '-'}</td>
//                                     </tr>
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>`;
//             });

//             $('#site-visit-content').html(content);
//         },
//         error: function(error) {
//             console.error("Site Visit API Error:", error);
//             frappe.msgprint("Error loading Site Visit data. Please check the console for details.");
//         }
//     });
// }

// function load_quotation_data(frm) {
//     $('#site-visit-content, #activity-content').hide();
//     $('#quotation-content').html('').hide();

//     console.log("Fetching Quotation data for:", frm.doc.name);

//     frappe.call({
//         method: 'custom_solar.custom_solar.doctype.leads.leads.get_quotation_ids',
//         args: { lead_id: frm.doc.name },
//         callback: function(response) {
//             console.log("Quotation API Response:", response);

//             if (response.exc) {
//                 console.error("Error fetching Quotation data:", response.exc);
//                 frappe.msgprint("Failed to fetch Quotation data.");
//                 return;
//             }

//             let quotations = response.message || [];
//             let content = '';

//             if (quotations.length === 0) {
//                 content = `<div class="alert alert-warning">No quotations found for this lead.</div>`;
//             } else {
//                 content = `
//                     <div class="quotation-details card p-3 mb-3">
//                         <h5 class="mb-3">Quotations</h5>
//                         <div class="table-responsive">
//                             <table class="table table-bordered">
//                                 <thead class="thead-light">
//                                     <tr>
//                                         <th>Quotation ID</th>
//                                         <th>Status</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>`;

//                 quotations.forEach((quotation) => {
//                     let status_badge_color = quotation.status === 'Accepted' ? 'success' : 
//                                              (quotation.status === 'Rejected' ? 'danger' :
//                                              (quotation.status === 'Pending' ? 'warning' : 'secondary'));

//                     content += `
//                         <tr>
//                             <td>${quotation.name || '-'}</td>
//                             <td>
//                                 <span class="badge bg-${status_badge_color}" id="status-${quotation.name}">
//                                     ${quotation.status || 'Pending'}
//                                 </span>
//                             </td>
//                         </tr>`;
//                 });

//                 content += `
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>`;
//             }

//             $('#quotation-content').html(content).fadeIn();
//         },
//         error: function(error) {
//             console.error("Quotation API Error:", error);
//             frappe.msgprint("Error loading Quotation data. Please check the console for details.");
//         }
//     });
// }




frappe.ui.form.on('Opportunity', {
    refresh: function(frm) {
        add_custom_tabs(frm); // Ensure tabs are added
        load_site_visit_data(frm); // Load Site Visit data for the opened lead
        // load_activity_data(frm);  // Load Activity data (as part of timeline)

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
        load_site_visit_data(frm);


        load_site_visit_data(frm);

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
