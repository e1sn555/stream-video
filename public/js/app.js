$('.delete_branch').on('click', function () {
  var id = $(this).attr('id');
  var url = '/admin/branches/' + id;
  Swal.fire({
    title: 'Silmək istədiyinizə əminsiniz?',
    showCancelButton: true,
    confirmButtonText: 'Sil',
    cancelButtonText: 'Ləğv et',
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        url: url,
        type: 'DELETE',
        success: function (result) {
          window.location.href = '/admin/branches';
        },
        error: function (err) {
          console.log(err);
        },
      });
    }
  });
});

$('.delete_video').on('click', function () {
  var id = $(this).attr('id');
  var url = '/admin/videos/' + id;
  Swal.fire({
    title: 'Silmək istədiyinizə əminsiniz?',
    showCancelButton: true,
    confirmButtonText: 'Sil',
    cancelButtonText: 'Ləğv et',
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        url: url,
        type: 'DELETE',
        success: function (result) {
          window.location.href = '/admin/videos';
        },
        error: function (err) {
          console.log(err);
        },
      });
    }
  });
});

$('#startDate').on('change', function () {
  var startDate = $(this).val();
  var endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 1);
  $('#endDate').attr('min', endDate.toISOString().split('T')[0]);
  $('#endDate').removeAttr('disabled');
});
