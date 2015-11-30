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

function gallery_sort(name){
    var $gallery = $('#id_'+ name );
    var $files = $('#gallery_' + name + ' ul li');

    var value = [];
    $.each($files, function(){
        value.push($(this).data().item);
    });

    $gallery.val(JSON.stringify(value));
}

function gallery_render(name){
    var $gallery = $('#id_'+ name );
    var files = JSON.parse($gallery.val());
    var $container = $('#gallery_' + name + ' ul');

    $container.empty();

    $.each(files, function(index){
        $container.append(
            $('<li />')
                .data('item', this)
                .data('name', name)
                .append(
                    $('<span />')
                        .append($('<img/>').attr('src', this.picture.url + '/convert?w=150&h=110').addClass('img-polaroid'))
                        .attr('href', this.picture.url)
                        .attr('target', '_blank')
                        .css({ cursor: 'pointer '})
                        .click(function(){
                            window.open($(this).attr('href'));
                        })
                )
                .append(
                    $('<span />').addClass('gallery-item-text').text(this.picture.filename)
                )
                .append(
                    $('<div />')
                        .addClass('gallery-list-buttons')
                        .append(
                            $('<span />')
                                .addClass('btn gallery-drag')
                                .append($('<i />').addClass('icon-resize-vertical'))
                        )
                        .append(
                            $('<span />')
                                .data('name', name)
                                .data('index', index)
                                .addClass('btn delete_picture')
                                .append($('<i />').addClass('icon-remove'))
                        )
                )
        );

    })
}

$(function(){
    $('body').on('click', 'span.delete_picture', function(e){
        e.preventDefault();

        gallery_delete_item($(this).data().name, $(this).data().index);
    });

    $('button.delete_all_pictures').on('click', function(e){
        e.preventDefault();

        gallery_delete_all($(this).data().name);
    });

    $('.gallery-container ul').sortable({
        axis: 'y',
        handle: '.gallery-drag',
        opacity: 0.8,
        update: function(e, ui){
            gallery_sort(ui.item.data().name);
        }
    }).disableSelection();
});