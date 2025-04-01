frappe.ui.form.on('Opportunity', {
    refresh: function(frm) {
        add_custom_tabs(frm); 
        load_site_visit_data(frm); 

        $('#site-visit-tab').addClass('active');
        $('#activity-tab').removeClass('active');
        $('#quotation-tab').removeClass('active');
    
        $('#site-visit-content').show();
        frm.timeline.timeline_items_wrapper.hide();  
        frm.timeline.wrapper.find('.timeline-item').hide(); 
        $('#quotation-content').hide();     

    },
    // onload : function(frm){
    //     add_custom_tabs(frm); 
    //     load_site_visit_data(frm); 

    // }
});

function add_custom_tabs(frm) {
    if (!frm.custom_tabs_added) {
        let timeline_wrapper = frm.timeline.wrapper;

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
            <div class="tab-pane fade" id="quotation-content" role="tabpanel">
                <!-- quotation logic will go here -->
            </div>
        </div>`;

        $(timeline_wrapper).prepend(tab_html);
        load_site_visit_data(frm);

        $('#activity-tab').on('click', function() {
            $('#site-visit-content').hide();  
            $('#quotation-content').hide();     
            frm.timeline.timeline_items_wrapper.show(); 
            frm.timeline.wrapper.find('.timeline-item').show();

            $('#site-visit-tab').removeClass('active');
            $('#activity-tab').addClass('active');
            $('#quotation-tab').removeClass('active');

            frm.timeline.wrapper.find('.timeline-items.timeline-actions').hide(); 
            frm.timeline.wrapper.find('.d-flex.align-items-center.show-all-activity').removeClass('d-flex').hide(); 

        });

        $('#site-visit-tab').on('click', function() {
            load_site_visit_data(frm);
            frm.timeline.timeline_items_wrapper.hide();  
            frm.timeline.wrapper.find('.timeline-item').hide();  
            $('#site-visit-content').show(); 
            $('#quotation-content').hide();      
            $('#dispatch-content').hide();     

            $('#activity-tab').removeClass('active');
            $('#site-visit-tab').addClass('active');
            $('#quotation-tab').removeClass('active');
            $('#dispatch-tab').removeClass('active');
        });
        
        $('#quotation-tab').on('click', function() {
            load_quotation_data(frm)
            frm.timeline.timeline_items_wrapper.hide(); 
            frm.timeline.wrapper.find('.timeline-item').hide();  
            $('#site-visit-content').hide(); 
            $('#quotation-content').show();     

            $('#activity-tab').removeClass('active');
            $('#site-visit-tab').removeClass('active');
            $('#quotation-tab').addClass('active');
        });

        frm.custom_tabs_added = true;  // Prevent duplicate tabs
    }
}

function load_site_visit_data(frm) {
    $('#site-visit-content').html('');  

    frm.timeline.timeline_items_wrapper.hide();
    frm.timeline.wrapper.find('.timeline-item').hide();
    $('#quotation-content').hide();    
    $('#dispatch-content').hide();      
 
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

            $('#site-visit-content').html(content); 
        }
    });
}

function load_quotation_data(frm) {
    $('#quotation-content').html(''); // Hide initially to avoid flickering

    $('#site-visit-content, #activity-content, #dispatch-content').hide();

    frm.timeline.timeline_items_wrapper.hide();
    frm.timeline.wrapper.find('.timeline-item').hide(); 

    frappe.call({
        method: 'custom_solar.custom_solar.doctype.leads.leads.get_quotation_ids',
        args: { lead_id: frm.doc.lead_id },
        callback: function(response) {
            let quotations = response.message || [];
            let content = '';

            if (quotations.length === 0) {
                content = `<div class="alert alert-warning">No quotations found for this lead.</div>`;
            } else {
                quotations.forEach((quotation) => {
                    let status_badge_color = quotation.status === 'Accepted' ? 'success' : 
                                             (quotation.status === 'Rejected' ? 'danger' :
                                             (quotation.status === 'Pending' ? 'warning' : 'secondary'));

                    // PDF button
                    let buttons = `
                        <button class="btn btn-primary btn-sm pdf-btn" data-id="${quotation.name}">PDF</button>
                    `;

                    content += `
                        <div class="quotation-details card p-3 mb-3" style="border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; opacity: 1;">
                            <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;">
                                <div class="quotation-id">
                                    <strong>Quotation ID:</strong> ${quotation.name || '-'}
                                </div>
                                <div class="status">
                                    <strong>Status:</strong> 
                                    <span class="badge bg-${status_badge_color} text-white p-1.5">${quotation.status || 'Pending'}</span>
                                </div>
                                <div class="actions">${buttons}</div>
                            </div>
                        </div>`;
                });
            }
            
            $('#quotation-content').html(content).attr('style', 'opacity: 1; visibility: visible; display: block;').fadeIn(); // Ensure smooth transition

            // PDF button logic
            $('.pdf-btn').on('click', function () {             
                let quotation_id = $(this).data('id');
                let base_url = window.location.origin;
                let print_format = "Quotation";

                let pdf_url = `${base_url}/api/method/frappe.utils.print_format.download_pdf?doctype=Quotations&name=${quotation_id}&format=${print_format}&no_letterhead=0`;
            
                window.open(pdf_url, '_blank');
            });
        }
    });
}
