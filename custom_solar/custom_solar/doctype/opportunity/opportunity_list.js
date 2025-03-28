frappe.listview_settings['Opportunity'] = {
    refresh: function(listview) {
       
        // Hide the "Add Opportunity" button
        listview.page.btn_primary.hide();

        // Hide the "Add Opportunity" button
        $('[data-liked-by]').hide();   
        $("use.like-icon").hide();
        $('[list-liked-by-me]').hide();
        $('[es-icon es-line.icon-sm]').hide();
        $('.level-item.list-row-activity.hidden-xs, .es-icon.es-line.icon-sm').hide();
        $('.level-item.list-row-activity.hidden-xs').hide();
    },
    onload: function(listview) {
        setTimeout(() => {
            $('.level-item.list-row-activity.hidden-xs').hide();
        }, 500); // Add delay to ensure elements are loaded
    }

};
