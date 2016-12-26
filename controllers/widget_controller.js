"use strict";

exports.embedCode = function(req, res) {
  res.status(200).json({
    code: "<script type='text/javascript'>//this is dummy js, will get updated with actual code</script>>"
  });
};
