frappe.listview_settings['Company Details'] = {
    refresh: function(listview) {

        // hide_name_column: true,
        // frm.set_df_property('name', 'visibility', 'hidden');
        // $('[data-fieldname="name"]').hide();

        // Hide the "Add Opportunity" button
        $('[data-liked-by]').hide();   
        $("use.like-icon").hide();
        $('[list-liked-by-me]').hide();
        $('[es-icon es-line.icon-sm]').hide();
        $('.level-item.list-row-activity.hidden-xs, .es-icon.es-line.icon-sm').hide();
	    $(".comment-count").hide();
	    $(".frappe-timestamp").hide();
	    $(".avatar-small").hide();
    },
    onload: function(listview) {
        setTimeout(() => {
            $('.level-item.list-row-activity.hidden-xs').hide();
        }, 500); // Add delay to ensure elements are loaded
    }

};
