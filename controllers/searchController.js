exports.search = (req, res) => {
  const query = (req.query.q || '').toUpperCase();
  const labs = ['G404A', 'G404B', 'V101'];
  const results = labs.filter(lab => lab.startsWith(query));
  res.json({ success: true, results });
};
