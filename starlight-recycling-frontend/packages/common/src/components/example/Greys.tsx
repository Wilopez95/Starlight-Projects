import React from 'react';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';

export default function Greys() {
  return (
    <Grid container spacing={1}>
      <Grid item xs={12} sm={2}>
        <Box bgcolor="grey.50" color="black" border="1px solid black" borderRadius="15px" p={2}>
          50
        </Box>
      </Grid>
      <Grid item xs={12} sm={2}>
        <Box bgcolor="grey.100" color="black" border="1px solid black" borderRadius="15px" p={2}>
          100
        </Box>
      </Grid>
      <Grid item xs={12} sm={2}>
        <Box bgcolor="grey.200" color="black" border="1px solid black" borderRadius="15px" p={2}>
          200
        </Box>
      </Grid>
      <Grid item xs={12} sm={2}>
        <Box bgcolor="grey.300" color="black" border="1px solid black" borderRadius="15px" p={2}>
          300
        </Box>
      </Grid>
      <Grid item xs={12} sm={2}>
        <Box bgcolor="grey.400" color="black" border="1px solid black" borderRadius="15px" p={2}>
          400
        </Box>
      </Grid>
      <Grid item xs={12} sm={2}>
        <Box bgcolor="grey.500" color="black" border="1px solid black" borderRadius="15px" p={2}>
          500
        </Box>
      </Grid>
      <Grid item xs={12} sm={2}>
        <Box bgcolor="grey.600" color="black" border="1px solid black" borderRadius="15px" p={2}>
          600
        </Box>
      </Grid>
      <Grid item xs={12} sm={2}>
        <Box bgcolor="grey.700" color="black" border="1px solid black" borderRadius="15px" p={2}>
          700
        </Box>
      </Grid>
      <Grid item xs={12} sm={2}>
        <Box bgcolor="grey.800" color="black" border="1px solid black" borderRadius="15px" p={2}>
          800
        </Box>
      </Grid>
      <Grid item xs={12} sm={2}>
        <Box bgcolor="grey.900" color="black" border="1px solid black" borderRadius="15px" p={2}>
          900
        </Box>
      </Grid>
    </Grid>
  );
}
