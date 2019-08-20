# PCBV

PCBV (Printed Circuit Board Viewer) is a webapp for annotating PCB's, targeted for use by reverse engineers.
It has a wide range of features, shortcuts, and abilities to make PCB annotation efficient and effective.

# Tech Stack
PCBV uses React for the client frontend and uses a Swagger (OpenAPI) backend which interfaces with a MySQL server to fullfill REST endpoints.
The PCB's are all rendered in HTML5 Canvas. You can check out the source to see how it all works.

# How can I use it?
I host PCBV here at [pcbv.lucasbaizer.dev](https://pcbv.lucasbaizer.dev). It's still heavily a work in progress but it is indeed usable in its current state.
I encourage you to try it out, or build it from source and host it yourself.

# MIT License
Copyright (c) 2019 Lucas Baizer

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
