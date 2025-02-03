
all: main.html
	mkdir -p ../docs/talk
	cp *.html ../docs/talk/

%.html: %.md
	marp --html $<

.PHONY: clean
clean:
	rm -rf main.html
