var res = res || {};
res.objs = res.objs || {};

res.objs.cube = 
`v 0.5 0.5 0.5
v 0.5 0.5 -0.5
v 0.5 -0.5 0.5
v .5 -0.5 -0.5
v -0.5 0.5 0.5
v -0.5 0.5 -0.5
v -0.5 -0.5 0.5
v -0.5 -0.5 -0.5
v 0.5 0.5 0.5
v 0.5 0.5 -0.5
v -0.5 0.5 0.5
v -0.5 0.5 -0.5
v 0.5 -0.5 0.5
v 0.5 -0.5 -0.5
v -0.5 -0.5 0.5
v -0.5 -0.5 -0.5
v 0.5 0.5 0.5
v 0.5 -0.5 0.5
v -0.5 0.5 0.5
v -0.5 -0.5 0.5
v 0.5 0.5 -0.5
v 0.5 -0.5 -0.5
v -0.5 0.5 -0.5
v -0.5 -0.5 -0.5

vn 1 0 0
vn 1 0 0
vn 1 0 0
vn 1 0 0
vn -1 0 0
vn -1 0 0
vn -1 0 0
vn -1 0 0
vn 0 1 0
vn 0 1 0
vn 0 1 0
vn 0 1 0
vn 0 -1 0
vn 0 -1 0
vn 0 -1 0
vn 0 -1 0
vn 0 0 1
vn 0 0 1
vn 0 0 1
vn 0 0 1
vn 0 0 -1
vn 0 0 -1
vn 0 0 -1
vn 0 0 -1

f 0 2 1
f 1 3 2
f 4 5 6
f 5 6 7
f 8 10 9
f 9 10 11
f 12 14 13
f 13 14 15
f 16 18 17
f 17 18 19
f 20 22 21
f 21 22 23
`;

res.objs.octahedron = 
`
v 0.5 0 0
v 0 0.5 0
v 0 0 0.5
v -0.5 0 0
v 0 0.5 0
v 0 0 0.5
v 0.5 0 0
v 0 -0.5 0
v 0 0 0.5
v -0.5 0 0
v 0 -0.5 0
v 0 0 0.5
v 0.5 0 0
v 0 0.5 0
v 0 0 -0.5
v -0.5 0 0
v 0 0.5 0
v 0 0 -0.5
v 0.5 0 0
v 0 -0.5 0
v 0 0 -0.5
v -0.5 0 0
v 0 -0.5 0
v 0 0 -0.5

`;