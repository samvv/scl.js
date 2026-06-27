
all: main.html
	mkdir -p ../docs/talk
	cp *.html *.png ../docs/talk/

%.html: %.md
	marp --html $<

.PHONY: clean
clean:
	rm -rf main.html
