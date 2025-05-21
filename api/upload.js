form.parse(req, (err, fields, files) => {
  console.log('FILES RECEIVED:', files);
  res.status(200).json({ fields, files });
});
