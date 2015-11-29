function gallery_onchange(e, name) {
    var $gallery = $('#id_'+ name );
    var files = JSON.parse($gallery.val());

    $gallery.val(
        JSON.stringify(
            files.concat(
                e.fpfiles.map(function(picture){
                    return {
                        picture: picture
                    }
                })
            )
        )
    );

    gallery_render(name);
}

function gallery_delete_item(name, index){
    var $gallery = $('#id_'+ name );
    var files = JSON.parse($gallery.val());

    files.splice(index, 1);
    $gallery.val(JSON.stringify(files));

    gallery_render(name);
}

function gallery_delete_all(name){
    var $gallery = $('#id_'+ name );
    $gallery.val(JSON.stringify([]));

    gallery_render(name);
}

function gallery_render(name){
    var $gallery = $('#id_'+ name );
    var files = JSON.parse($gallery.val());
    var $container = $('#gallery_' + name);

    $container.empty();

    $.each(files, function(index){
        $container.append(
            $('<p />')
                .append($('<img/>').attr('src', this.picture.url + '/convert?w=150&h=110').addClass('img-polaroid'))
                .append(
                    $('<button />')
                        .data('name', name)
                        .data('index', index)
                        .addClass('btn btn-danger delete_picture')
                        .text('Delete'))
        );

    })
}

$(function(){
    $('body').on('click', 'button.delete_picture', function(e){
        e.preventDefault();

        gallery_delete_item($(this).data().name, $(this).data().index);
    });

    $('button.delete_all_pictures').on('click', function(e){
        e.preventDefault();

        gallery_delete_all($(this).data().name);
    })
});