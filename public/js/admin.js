$(function(){
	//后台列表页删除功能
	$('.del').on('click',function (e){
		var target = $(e.target);
		var id = target.data('id');
		var tr = $('.item-id-' + id);
		$.ajax({
			type:'DELETE',
			url:'/admin/list?id=' + id
		}).done(function (results){
			if(results.success === 1){
				if(tr.length > 0){
					tr.remove();
				}
			}
		});
	});
});